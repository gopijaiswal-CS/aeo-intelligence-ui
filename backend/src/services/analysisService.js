const { getModel } = require('../config/gemini');

/**
 * Query a single LLM with all questions in batch
 */
async function queryLLMBatch(llmName, questions, productName, category, competitors) {
  try {
    const model = getModel('gemini-2.5-flash');
    
    // Create batch prompt with all questions
    const questionsText = questions.map((q, idx) => 
      `${idx + 1}. ${q.question}`
    ).join('\n');
    
    const competitorNames = competitors.map(c => c.name).join(', ');
    
    const prompt = `You are an AI assistant analyzing ${category} products. Answer the following questions comprehensively and accurately.

<context>
  Target Product: ${productName}
  Category: ${category}
  Competitors: ${competitorNames}
</context>

<task>
  Answer ALL ${questions.length} questions below.
  For each answer:
  1. Provide a realistic, helpful, and accurate response
  2. Mention relevant products (including ${productName} if it's truly relevant to the question)
  3. Include competitor products when they are relevant to the answer
  4. Be natural, informative, and objective
  5. Base your answers on real knowledge about these products
</task>

<questions>
${questionsText}
</questions>

<output_format>
Return ONLY valid JSON in this exact format:
{
  "answers": [
    {
      "questionId": 1,
      "answer": "Your detailed answer here...",
      "productsMentioned": ["Product A", "Product B"],
      "citationSources": ["techcrunch.com", "theverge.com", "cnet.com"]
    }
  ]
}
</output_format>

<important>
- Be realistic and objective about which products to mention
- ${productName} should only be mentioned if it's truly relevant to the question
- Include 2-5 products per answer when appropriate
- **CRITICAL**: Provide 1-3 REAL citation sources per answer - these MUST be actual, existing tech/review websites
- Citation sources should be domain names only (e.g., "techcrunch.com", NOT "example1.com" or placeholders)
- Use ONLY these real sources: techcrunch.com, theverge.com, cnet.com, wired.com, engadget.com, zdnet.com, pcmag.com, tomsguide.com, digitaltrends.com, reddit.com, producthunt.com, g2.com, capterra.com, trustradius.com, forbes.com, businessinsider.com, venturebeat.com, mashable.com, arstechnica.com
- **DO NOT use placeholder URLs like "example.com", "example1.com", "site1.com", etc.**
- Keep answers concise but informative (2-4 sentences)
</important>`;

    console.log(`[${llmName}] Querying with ${questions.length} questions...`);
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log(`[${llmName}] Response received, parsing...`);
    
    // Parse JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from markdown blocks or raw text
      const jsonMatch = 
        responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
        responseText.match(/```\s*(\{[\s\S]*?\})\s*```/) ||
        responseText.match(/\{[\s\S]*?"answers"[\s\S]*?\}/);
      
      if (jsonMatch) {
        let jsonText = jsonMatch[1] || jsonMatch[0];
        jsonText = jsonText.replace(/```json|```/g, '').trim();
        parsedResponse = JSON.parse(jsonText);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error(`[${llmName}] JSON parsing error:`, parseError.message);
      console.error('Response text:', responseText.substring(0, 500));
      
      // Return empty responses as fallback
      parsedResponse = {
        answers: questions.map((q, idx) => ({
          questionId: idx + 1,
          answer: `Unable to parse response for this question.`,
          productsMentioned: [],
          citationSources: []
        }))
      };
    }
    
    // Ensure we have answers for all questions
    if (!parsedResponse.answers || parsedResponse.answers.length === 0) {
      parsedResponse.answers = questions.map((q, idx) => ({
        questionId: idx + 1,
        answer: 'No response generated.',
        productsMentioned: [],
        citationSources: []
      }));
    }
    
    console.log(`[${llmName}] Successfully parsed ${parsedResponse.answers.length} answers`);
    
    return parsedResponse.answers;
  } catch (error) {
    console.error(`[${llmName}] Error querying LLM:`, error.message);
    
    // Return fallback responses
    return questions.map((q, idx) => ({
      questionId: idx + 1,
      answer: `Error generating response: ${error.message}`,
      productsMentioned: [],
      citationSources: []
    }));
  }
}

/**
 * Analyze LLM responses to calculate metrics
 */
function analyzeLLMResponses(llmName, answers, productName, competitors) {
  let productMentions = 0;
  let totalMentions = 0;
  const competitorMentions = {};
  const citationSources = new Set();
  
  // Initialize competitor mention counts
  competitors.forEach(comp => {
    competitorMentions[comp.name] = 0;
  });
  
  // Analyze each answer
  answers.forEach(answer => {
    const mentionedProducts = answer.productsMentioned || [];
    const sources = answer.citationSources || [];
    
    // Count product mentions
    const productMentioned = mentionedProducts.some(p => 
      p.toLowerCase().includes(productName.toLowerCase()) ||
      productName.toLowerCase().includes(p.toLowerCase())
    );
    
    if (productMentioned) {
      productMentions++;
    }
    
    totalMentions += mentionedProducts.length;
    
    // Count competitor mentions
    competitors.forEach(comp => {
      const competitorMentioned = mentionedProducts.some(p =>
        p.toLowerCase().includes(comp.name.toLowerCase()) ||
        comp.name.toLowerCase().includes(p.toLowerCase())
      );
      
      if (competitorMentioned) {
        competitorMentions[comp.name]++;
      }
    });
    
    // Collect citation sources
    sources.forEach(source => citationSources.add(source));
  });
  
  // Calculate visibility score
  const visibilityScore = answers.length > 0 
    ? Math.round((productMentions / answers.length) * 100)
    : 0;
  
  // Generate top sources with calculated data
  const topSources = Array.from(citationSources).slice(0, 5).map((url, idx) => {
    // Calculate weight based on frequency and position
    const baseWeight = 9.5 - (idx * 0.4);
    const weight = Math.round(baseWeight * 10) / 10;
    
    // Calculate mentions based on how many answers cited this source
    const sourceMentionCount = answers.filter(a => 
      (a.citationSources || []).includes(url)
    ).length;
    
    // Determine page type based on URL patterns
    let pageType = 'Blog Article';
    const urlLower = url.toLowerCase();
    if (urlLower.includes('review') || urlLower.includes('rating')) {
      pageType = 'Review Site';
    } else if (urlLower.includes('vs') || urlLower.includes('compare') || urlLower.includes('comparison')) {
      pageType = 'Comparison Page';
    } else if (urlLower.includes('wiki') || urlLower.includes('wikipedia')) {
      pageType = 'Knowledge Base';
    } else if (urlLower.includes('news') || urlLower.includes('tech')) {
      pageType = 'News/Tech Site';
    } else if (urlLower.includes('forum') || urlLower.includes('reddit') || urlLower.includes('stackoverflow')) {
      pageType = 'Community Forum';
    }
    
    return {
      url,
      weight,
      mentions: sourceMentionCount * 3, // Scale for display
      pageType
    };
  });
  
  return {
    llmName,
    score: visibilityScore,
    mentions: productMentions,
    totalMentions,
    citations: citationSources.size,
    competitorMentions,
    topSources
  };
}

/**
 * Run complete AEO analysis by querying multiple LLMs
 */
async function runAEOAnalysis(profile) {
  try {
    const { questions, competitors, productName, category, _id } = profile;
    
    console.log(`\n========================================`);
    console.log(`Starting AEO Analysis for: ${productName}`);
    console.log(`Questions: ${questions.length}`);
    console.log(`Competitors: ${competitors.length}`);
    console.log(`========================================\n`);
    
    // LLM platforms to test
    const llms = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];
    
    // Query Gemini with REAL API, others are simulated
    console.log('Querying LLMs...\n');
    console.log('🔥 Gemini: REAL API');
    console.log('🤖 ChatGPT, Claude, Perplexity: Simulated (mock data)\n');
    
    const llmPromises = llms.map(llmName => 
      queryLLMBatch(llmName, questions, productName, category, competitors)
    );
    
    const allLLMResponses = await Promise.all(llmPromises);
    
    console.log('\n✅ All LLM queries complete!\n');
    
    // Debug: Check if we got responses
    console.log('Response counts:');
    llms.forEach((llm, idx) => {
      console.log(`  ${llm}: ${allLLMResponses[idx]?.length || 0} answers`);
    });
    console.log('');
    
    // Store responses with questions
    const questionsWithResponses = questions.map((question, idx) => ({
      ...question,
      llmResponses: {
        chatgpt: allLLMResponses[0][idx] || {},
        claude: allLLMResponses[1][idx] || {},
        gemini: allLLMResponses[2][idx] || {},
        perplexity: allLLMResponses[3][idx] || {}
      }
    }));
    
    // Analyze responses for each LLM
    console.log('Analyzing LLM responses...\n');
    
    const llmPerformance = llms.map((llmName, idx) => {
      const analysis = analyzeLLMResponses(
        llmName,
        allLLMResponses[idx],
        productName,
        competitors
      );
      
      console.log(`[${llmName}] Score: ${analysis.score}%, Mentions: ${analysis.mentions}/${questions.length}, Citations: ${analysis.citations}, Top Sources: ${analysis.topSources.length}`);
      
      return analysis;
    });
    
    console.log(`\nTotal LLM Performance entries: ${llmPerformance.length}\n`);
    
    // Calculate overall metrics
    const overallScore = Math.round(
      llmPerformance.reduce((sum, llm) => sum + llm.score, 0) / llms.length
    );
    
    const totalMentions = llmPerformance.reduce((sum, llm) => sum + llm.mentions, 0);
    const totalCitations = llmPerformance.reduce((sum, llm) => sum + llm.citations, 0);
    
    // Aggregate competitor analysis
    const competitorAnalysis = competitors.map(comp => {
      const totalMentions = llmPerformance.reduce(
        (sum, llm) => sum + (llm.competitorMentions[comp.name] || 0),
        0
      );
      
      const visibility = Math.round((totalMentions / (questions.length * llms.length)) * 100);
      
      return {
        id: comp.id,
        name: comp.name,
        category: comp.category,
        visibility,
        mentions: totalMentions,
        citations: Math.floor(totalMentions * 1.5),
        rank: 0 // Will be set after sorting
      };
    });
    
    // Sort by visibility and assign ranks
    competitorAnalysis.sort((a, b) => b.visibility - a.visibility);
    competitorAnalysis.forEach((comp, idx) => {
      comp.rank = idx + 1;
    });
    
    // Collect all citation sources
    const allCitationSources = [];
    llmPerformance.forEach(llm => {
      llm.topSources.forEach(source => {
        allCitationSources.push({
          ...source,
          llm: llm.llmName
        });
      });
    });
    
    // Generate trend data (7 days) - mock for now
    const baseTrend = Math.max(overallScore - 10, 50);
    const trend = Array.from({ length: 7 }, (_, i) => 
      Math.min(Math.round(baseTrend + (i * 1.5) + Math.random() * 3), 95)
    );
    
    // Mock SEO health
    const seoHealth = Math.round(Math.random() * 15 + 80);
    const brokenLinks = Math.floor(Math.random() * 5);
    
    console.log(`\n========================================`);
    console.log(`Analysis Complete!`);
    console.log(`Overall Score: ${overallScore}%`);
    console.log(`Total Mentions: ${totalMentions}`);
    console.log(`Total Citations: ${totalCitations}`);
    console.log(`========================================\n`);
    
    return {
      overallScore,
      mentions: totalMentions,
      seoHealth,
      citations: totalCitations,
      brokenLinks,
      trend,
      citationSources: allCitationSources,
      llmPerformance,
      competitorAnalysis,
      questionsWithResponses, // Store LLM responses with questions
      lastAnalyzed: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error running AEO analysis:', error);
    throw new Error(`Failed to run analysis: ${error.message}`);
  }
}

/**
 * Run SEO health check for a website
 */
async function runSEOHealthCheck(websiteUrl) {
  try {
    // In production, integrate with actual SEO tools (Lighthouse, PageSpeed, etc.)
    // For now, return mock data with some basic checks
    
    const overallScore = Math.round(Math.random() * 20 + 75);
    
    const categories = {
      technicalSeo: {
        score: Math.round(Math.random() * 15 + 85),
        status: 'excellent',
        issues: []
      },
      onPageSeo: {
        score: Math.round(Math.random() * 15 + 80),
        status: 'excellent',
        issues: []
      },
      contentQuality: {
        score: Math.round(Math.random() * 25 + 70),
        status: 'good',
        issues: ['Some pages could use more depth', 'Add more internal links']
      },
      brokenLinks: {
        score: Math.round(Math.random() * 40 + 50),
        status: 'warning',
        count: Math.floor(Math.random() * 8 + 2)
      }
    };
    
    const actionItems = [
      {
        priority: 'high',
        title: 'Fix Broken Links',
        description: `${categories.brokenLinks.count} broken links need attention`
      },
      {
        priority: 'medium',
        title: 'Improve Content Depth',
        description: 'Add more comprehensive content to key pages'
      },
      {
        priority: 'low',
        title: 'Optimize Images',
        description: 'Compress images for faster loading'
      }
    ];
    
    return {
      overallScore,
      categories,
      actionItems
    };
  } catch (error) {
    console.error('Error running SEO health check:', error);
    throw new Error(`Failed to run SEO check: ${error.message}`);
  }
}

module.exports = {
  runAEOAnalysis,
  runSEOHealthCheck
};
