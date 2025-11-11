const { getModel } = require('../config/gemini');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Generate products from a website URL using Gemini AI
 */
async function generateProducts(websiteUrl) {
  try {
    // Fetch website content
    let websiteContent = '';
    try {
      const response = await axios.get(websiteUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      
      // Extract text content from relevant tags
      const title = $('title').text();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const h1 = $('h1').text();
      const h2 = $('h2').map((i, el) => $(el).text()).get().join(' ');
      const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 10).join(' ');
      
      websiteContent = `Title: ${title}\nDescription: ${metaDescription}\nH1: ${h1}\nH2: ${h2}\nContent: ${paragraphs}`.substring(0, 5000);
    } catch (error) {
      console.log('Could not fetch website content, using URL only:', error.message);
      websiteContent = `Website URL: ${websiteUrl}`;
    }

    const model = getModel();
    const prompt = `Analyze the following website and extract a list of products/services they offer. Return a JSON array of products with id, name, category, and description fields.

Website Content:
${websiteContent}

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": 1,
    "name": "Product Name",
    "category": "Category",
    "description": "Brief description"
  }
]

Identify 3-5 main products/services. Be specific and accurate.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    let products = [];
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create products from response
        products = [
          {
            id: 1,
            name: 'Product Analysis',
            category: 'General',
            description: 'Extracted from website analysis'
          }
        ];
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Return default products
      products = [
        {
          id: 1,
          name: 'Main Product',
          category: 'General',
          description: 'Primary product or service'
        }
      ];
    }

    // Suggest regions
    const suggestedRegions = ['us', 'eu', 'global'];

    return {
      products,
      suggestedRegions
    };
  } catch (error) {
    console.error('Error generating products:', error);
    throw new Error(`Failed to generate products: ${error.message}`);
  }
}

/**
 * Generate questions and competitors using Gemini AI
 */
async function generateQuestionsAndCompetitors(productName, category, region) {
  try {
    const model = getModel();
    
    // Generate Questions
    const questionsPrompt = `Generate 20 diverse test questions that users might ask AI assistants (ChatGPT, Claude, Gemini, Perplexity) about "${productName}" in the "${category}" category for the ${region} region.

Questions should cover these categories (distribute evenly):
- Product Recommendation
- Feature Comparison
- How-To
- Technical
- Price Comparison
- Security
- Use Case
- Compatibility

Return ONLY a valid JSON array in this format:
[
  {
    "id": 1,
    "question": "What are the best...",
    "category": "Product Recommendation"
  }
]

Make questions natural and varied.`;

    const questionsResult = await model.generateContent(questionsPrompt);
    const questionsText = questionsResult.response.text();
    
    let questions = [];
    try {
      const jsonMatch = questionsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
        // Add region and default values
        questions = questions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          category: q.category,
          region: region,
          aiMentions: 0,
          visibility: 0,
          addedBy: 'auto'
        }));
      }
    } catch (parseError) {
      console.error('Questions JSON parsing error:', parseError);
    }

    // Generate Competitors
    const competitorsPrompt = `Identify 5-7 main competitors for "${productName}" in the "${category}" category.

Return ONLY a valid JSON array in this format:
[
  {
    "id": 1,
    "name": "Competitor Name",
    "category": "${category}"
  }
]

List real competitors or similar products/services.`;

    const competitorsResult = await model.generateContent(competitorsPrompt);
    const competitorsText = competitorsResult.response.text();
    
    let competitors = [];
    try {
      const jsonMatch = competitorsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        competitors = JSON.parse(jsonMatch[0]);
        // Add default values
        competitors = competitors.map((c, index) => ({
          id: index + 1,
          name: c.name,
          category: c.category || category,
          visibility: 0,
          mentions: 0,
          citations: 0,
          rank: index + 1
        }));
      }
    } catch (parseError) {
      console.error('Competitors JSON parsing error:', parseError);
    }

    return {
      questions,
      competitors
    };
  } catch (error) {
    console.error('Error generating questions and competitors:', error);
    throw new Error(`Failed to generate data: ${error.message}`);
  }
}

/**
 * Get content optimization recommendations using Gemini AI
 */
async function getOptimizationRecommendations(profileData) {
  try {
    const model = getModel();
    
    const prompt = `Analyze this product and provide 5 detailed content optimization recommendations to improve AI visibility and citation weight.

Product: ${profileData.productName}
Category: ${profileData.category}
Website: ${profileData.websiteUrl}
Current Visibility: ${profileData.analysisResult?.overallScore || 0}%

Provide recommendations in the following JSON format:
[
  {
    "priority": "critical|high|medium|low",
    "title": "Recommendation Title",
    "description": "Detailed description",
    "category": "technical|content|seo|citations",
    "difficulty": "easy|moderate|hard",
    "impact": "high|medium|low",
    "improvement": "+X% visibility",
    "actionItems": ["Action 1", "Action 2", "Action 3"]
  }
]

Focus on:
1. Technical SEO improvements
2. Content quality enhancements
3. Citation building strategies
4. Schema markup and structured data
5. Natural language optimization

Return ONLY valid JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    let recommendations = [];
    let summary = 'AI-powered analysis completed successfully.';
    let projectedScore = (profileData.analysisResult?.overallScore || 65) + 12;
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
      
      // Extract summary if present
      const summaryMatch = text.match(/summary[:\s]+([^\n]+)/i);
      if (summaryMatch) {
        summary = summaryMatch[1];
      }
    } catch (parseError) {
      console.error('Recommendations JSON parsing error:', parseError);
    }

    return {
      summary,
      projectedScore: Math.min(projectedScore, 98),
      recommendations
    };
  } catch (error) {
    console.error('Error getting optimization recommendations:', error);
    throw new Error(`Failed to get recommendations: ${error.message}`);
  }
}

module.exports = {
  generateProducts,
  generateQuestionsAndCompetitors,
  getOptimizationRecommendations
};

