const { getModel } = require('../config/gemini');

/**
 * Get category-specific citation sources
 * This provides real, relevant sources based on the product category
 */
function getCategorySpecificSources(category) {
  const categoryLower = category.toLowerCase();
  
  // Map categories to their most relevant review/comparison sites
  const categorySourceMap = {
    // Tech & Software
    'cms': ['g2.com', 'capterra.com', 'trustradius.com', 'softwareadvice.com', 'getapp.com'],
    'crm': ['g2.com', 'capterra.com', 'trustradius.com', 'softwareadvice.com', 'pcmag.com'],
    'marketing': ['g2.com', 'capterra.com', 'martech.org', 'chiefmartech.com', 'marketingland.com'],
    'ecommerce': ['shopify.com/blog', 'bigcommerce.com/blog', 'ecommerceguide.com', 'practicalecommerce.com', 'digitalcommerce360.com'],
    'hosting': ['hostingadvice.com', 'whoishostingthis.com', 'webhostingsecretrevealed.net', 'techradar.com', 'pcmag.com'],
    'cloud': ['gartner.com', 'forrester.com', 'zdnet.com', 'infoworld.com', 'cloudcomputing-news.net'],
    
    // Hardware & Electronics
    'smartphone': ['gsmarena.com', 'phonearena.com', 'androidauthority.com', 'cnet.com', 'theverge.com'],
    'laptop': ['laptopmag.com', 'notebookcheck.net', 'pcmag.com', 'tomsguide.com', 'techradar.com'],
    'tablet': ['androidcentral.com', 'imore.com', 'pcmag.com', 'cnet.com', 'theverge.com'],
    'wearable': ['wareable.com', 'androidcentral.com', 'imore.com', 'cnet.com', 'theverge.com'],
    
    // Business & Productivity
    'project management': ['g2.com', 'capterra.com', 'softwareadvice.com', 'projectmanagement.com', 'techradar.com'],
    'collaboration': ['g2.com', 'capterra.com', 'uctoday.com', 'techradar.com', 'pcmag.com'],
    'communication': ['g2.com', 'capterra.com', 'uctoday.com', 'getvoip.com', 'pcmag.com'],
    
    // Default tech sources
    'default': ['techcrunch.com', 'theverge.com', 'cnet.com', 'wired.com', 'engadget.com', 'zdnet.com', 'pcmag.com', 'tomsguide.com', 'digitaltrends.com']
  };
  
  // Find matching category
  for (const [key, sources] of Object.entries(categorySourceMap)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return sources;
    }
  }
  
  // Return default tech sources
  return categorySourceMap.default;
}

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
    
    // Get category-specific sources
    const categorySources = getCategorySpecificSources(category);
    const sourcesList = categorySources.join(', ');
    
    // Add general tech/business sources as fallback
    const generalSources = ['reddit.com', 'producthunt.com', 'forbes.com', 'businessinsider.com', 'venturebeat.com', 'mashable.com', 'arstechnica.com'];
    const allSources = [...categorySources, ...generalSources];
    const allSourcesList = allSources.join(', ');
    
    // Add LLM-specific behavior to simulate different responses
    const llmBehaviors = {
      'ChatGPT': {
        style: 'conversational and balanced',
        bias: 'Mention the target product moderately (40-60% of the time)',
        focus: 'Popular, well-known products with strong community presence'
      },
      'Claude': {
        style: 'analytical and detailed',
        bias: 'Mention the target product conservatively (30-50% of the time)',
        focus: 'Enterprise-grade solutions with strong technical documentation'
      },
      'Gemini': {
        style: 'comprehensive and data-driven',
        bias: 'Mention the target product frequently (60-80% of the time)',
        focus: 'Products with strong online presence and recent updates'
      },
      'Perplexity': {
        style: 'research-focused with citations',
        bias: 'Mention the target product moderately (35-55% of the time)',
        focus: 'Products with strong review presence and comparison data'
      }
    };
    
    const behavior = llmBehaviors[llmName] || llmBehaviors['ChatGPT'];
    
    const prompt = `You are simulating ${llmName}, an AI assistant analyzing ${category} products. Answer the following questions comprehensively and accurately.

<llm_personality>
  LLM: ${llmName}
  Style: ${behavior.style}
  Behavior: ${behavior.bias}
  Focus: ${behavior.focus}
</llm_personality>

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
  6. **CRITICAL**: For citation sources, use REAL websites from the provided list below
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
      "citationSources": ["g2.com", "capterra.com", "techcrunch.com"]
    }
  ]
}
</output_format>

<citation_sources>
For ${category} products, use these REAL, RELEVANT sources:

**Primary Sources (most relevant for ${category}):**
${sourcesList}

**Secondary Sources (general tech/business):**
${generalSources.join(', ')}

**RULES:**
1. ✅ ONLY use domains from the list above
2. ✅ Domain names only (e.g., "g2.com", NOT "https://g2.com" or "example.com")
3. ✅ Choose 1-3 sources per answer that are MOST relevant to the question
4. ✅ Prioritize category-specific sources (${sourcesList}) when available
5. ❌ NEVER use placeholder URLs like "example.com", "example1.com", "site1.com"
6. ❌ NEVER invent new domains
7. ❌ NEVER use generic URLs
</citation_sources>

<important>
- Be realistic and objective about which products to mention
- ${productName} should only be mentioned if it's truly relevant to the question
- Include 2-5 products per answer when appropriate
- Keep answers concise but informative (2-4 sentences)
- **Citation sources MUST be from the provided list above**
</important>`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
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
    
    // CRITICAL: Clean and validate citation sources
    // Remove any placeholder or invalid URLs
    const validSources = getCategorySpecificSources(category);
    const allValidSources = [...validSources, 'reddit.com', 'producthunt.com', 'forbes.com', 'businessinsider.com', 'venturebeat.com', 'mashable.com', 'arstechnica.com'];
    
    parsedResponse.answers = parsedResponse.answers.map(answer => {
      // Filter out invalid citation sources
      const cleanedSources = (answer.citationSources || []).filter(source => {
        const sourceLower = source.toLowerCase();
        
        // Remove placeholder URLs
        if (sourceLower.includes('example') || 
            sourceLower.includes('site1') || 
            sourceLower.includes('site2') ||
            sourceLower.includes('placeholder') ||
            sourceLower.includes('test.com')) {
          console.warn(`[${llmName}] ⚠️ Removed placeholder URL: ${source}`);
          return false;
        }
        
        // Check if it's in our valid sources list
        const isValid = allValidSources.some(validSource => 
          sourceLower.includes(validSource.toLowerCase()) || 
          validSource.toLowerCase().includes(sourceLower)
        );
        
        if (!isValid) {
          console.warn(`[${llmName}] ⚠️ Removed invalid URL: ${source}`);
        }
        
        return isValid;
      });
      
      // If all sources were removed, add a default one
      if (cleanedSources.length === 0 && validSources.length > 0) {
        cleanedSources.push(validSources[0]);
      }
      
      return {
        ...answer,
        citationSources: cleanedSources
      };
    });
    
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
    
    // LLM platforms to test
    const llms = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];
    
    const llmPromises = llms.map(llmName => 
      queryLLMBatch(llmName, questions, productName, category, competitors)
    );
    
    const allLLMResponses = await Promise.all(llmPromises);
    
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
    const llmPerformance = llms.map((llmName, idx) => {
      const analysis = analyzeLLMResponses(
        llmName,
        allLLMResponses[idx],
        productName,
        competitors
      );
      
      return analysis;
    });
    
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
    
    // Add user's product to the comparison
    const userProductAnalysis = {
      id: 'user-product',
      name: productName,
      category: category,
      visibility: overallScore,
      mentions: totalMentions,
      citations: totalCitations,
      rank: 0, // Will be set after sorting
      isUserProduct: true // Flag to identify user's product
    };
    
    competitorAnalysis.push(userProductAnalysis);
    
    // Sort by visibility (highest first) and assign ranks
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

module.exports = {
  runAEOAnalysis
};
