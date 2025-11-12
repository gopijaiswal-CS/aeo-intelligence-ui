const { getModel } = require("../config/gemini");
const axios = require("axios");
const cheerio = require("cheerio");
const { generateProductsList } = require("../prompts/generateProductsList");

/**
 * Generate products from a website URL using Gemini AI
 */
async function generateProducts(websiteUrl) {
  try {
    // Normalize URL
    const normalizedUrl =
      websiteUrl.startsWith("http") || websiteUrl.startsWith("https")
        ? websiteUrl
        : `https://${websiteUrl}`;

    // Use the generateProductsList prompt template
    const model = getModel("gemini-2.5-flash");
    const prompt = generateProductsList(normalizedUrl);
    // `\n\nWebsite Content for Analysis:\n${websiteContent}`;

    console.log("Prompt:", prompt);
    // console.log("Generating products for URL:", normalizedUrl);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("Gemini AI Response:", text);

    // Extract JSON from response
    let products = [];
    try {
      // Try to find JSON in the response (look for json block or array)
      const jsonMatch =
        text.match(/<json>\s*(\{[\s\S]*?\})\s*<\/json>/) ||
        text.match(/\{[\s\S]*?"products"[\s\S]*?\}/) ||
        text.match(/\[[\s\S]*?\]/);

      if (jsonMatch) {
        let jsonText = jsonMatch[1] || jsonMatch[0];
        const parsedData = JSON.parse(jsonText);

        // Handle both formats: {"products": [...]} and [...]
        const productsList = parsedData.products || parsedData;

        // Convert to our format
        products = productsList.map((product, index) => ({
          id: index + 1,
          name: typeof product === "string" ? product : product.name || product,
          category: product.category || "General",
          description: product.description || `${product} product or service`,
        }));
      } else {
        // Fallback: try to extract product names from text
        const productNames = text.match(/"([^"]+)"/g);
        if (productNames && productNames.length > 0) {
          products = productNames.slice(0, 5).map((name, index) => ({
            id: index + 1,
            name: name.replace(/"/g, ""),
            category: "General",
            description: "Extracted from website analysis",
          }));
        } else {
          // Last resort fallback
          products = [
            {
              id: 1,
              name: "Product Analysis",
              category: "General",
              description: "Extracted from website analysis",
            },
          ];
        }
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Response text:", text);
      // Return default products
      products = [
        {
          id: 1,
          name: "Main Product",
          category: "General",
          description: "Primary product or service",
        },
      ];
    }

    // Suggest regions
    const suggestedRegions = ["us", "uk", "eu", "asia", "global"];

    return {
      products,
      suggestedRegions,
    };
  } catch (error) {
    console.error("Error generating products:", error);
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
          addedBy: "auto",
        }));
      }
    } catch (parseError) {
      console.error("Questions JSON parsing error:", parseError);
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
          rank: index + 1,
        }));
      }
    } catch (parseError) {
      console.error("Competitors JSON parsing error:", parseError);
    }

    return {
      questions,
      competitors,
    };
  } catch (error) {
    console.error("Error generating questions and competitors:", error);
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
    let summary = "AI-powered analysis completed successfully.";
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
      console.error("Recommendations JSON parsing error:", parseError);
    }

    return {
      summary,
      projectedScore: Math.min(projectedScore, 98),
      recommendations,
    };
  } catch (error) {
    console.error("Error getting optimization recommendations:", error);
    throw new Error(`Failed to get recommendations: ${error.message}`);
  }
}

module.exports = {
  generateProducts,
  generateQuestionsAndCompetitors,
  getOptimizationRecommendations,
};
