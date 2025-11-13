const { getModel } = require("../config/gemini");
const axios = require("axios");
const cheerio = require("cheerio");
const { generateProductsList } = require("../prompts/generateProductsList");
const { generateQuestionsAndCompetitors: generateQCPrompt } = require("../prompts/generateQuestionsAndCompetitors");

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
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    let products = [];
    try {
      // Try to find JSON in the response (handle markdown code blocks, XML tags, or raw JSON)
      const jsonMatch =
        text.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||           // Markdown: ```json {...} ```
        text.match(/```\s*(\{[\s\S]*?\})\s*```/) ||               // Markdown: ``` {...} ```
        text.match(/<json>\s*(\{[\s\S]*?\})\s*<\/json>/) ||       // XML: <json>{...}</json>
        text.match(/\{[\s\S]*?"products"[\s\S]*?\}/) ||           // Raw JSON with "products"
        text.match(/\[[\s\S]*?\]/);                                // Raw array

      if (jsonMatch) {
        let jsonText = jsonMatch[1] || jsonMatch[0];
        // Clean up any remaining markdown or whitespace
        jsonText = jsonText.replace(/```json|```/g, '').trim();
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
async function generateQuestionsAndCompetitors(productName, category, region, websiteUrl = '') {
  try {
    const model = getModel("gemini-2.5-flash");

    // Use the comprehensive prompt template
    const prompt = generateQCPrompt(productName, category, region, websiteUrl);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let questions = [];
    let competitors = [];

    try {
      // Try to find JSON in the response (handle markdown code blocks first)
      const jsonMatch = 
        text.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||                      // Markdown: ```json {...} ```
        text.match(/```\s*(\{[\s\S]*?\})\s*```/) ||                          // Markdown: ``` {...} ```
        text.match(/\{[\s\S]*?"questions"[\s\S]*?"competitors"[\s\S]*?\}/) || // Raw JSON with both keys
        text.match(/\{[\s\S]*?\}/);                                           // Any JSON object

      if (jsonMatch) {
        let jsonText = jsonMatch[1] || jsonMatch[0];
        // Clean up the JSON text (remove markdown and whitespace)
        jsonText = jsonText.replace(/```json|```/g, '').trim();
        
        const parsedData = JSON.parse(jsonText);

        // Extract questions
        if (parsedData.questions && Array.isArray(parsedData.questions)) {
          questions = parsedData.questions.map((q, index) => ({
            id: index + 1,
            question: q.question,
            category: q.category || "General",
            region: q.region || region,
            aiMentions: 0,
            visibility: 0,
            addedBy: "auto",
          }));
        } else {
          console.warn("⚠️ No questions array found in parsed data");
        }

        // Extract competitors
        if (parsedData.competitors && Array.isArray(parsedData.competitors)) {
          competitors = parsedData.competitors.map((c, index) => ({
            id: index + 1,
            name: c.name,
            category: c.category || category,
            description: c.description || `Competitor in ${category} category`,
            visibility: 0,
            mentions: 0,
            citations: 0,
            rank: index + 1,
          }));
        } else {
          console.warn("⚠️ No competitors array found in parsed data");
        }
      } else {
        console.warn("⚠️ Could not find JSON in response, using fallback");
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Response text:", text);
    }

    // Fallback if no questions generated
    if (questions.length === 0) {
      console.warn("⚠️ Using fallback questions (AI generation failed or returned no questions)");
      questions = [
        {
          id: 1,
          question: `What is ${productName}?`,
          category: "Product Recommendation",
          region: region,
          aiMentions: 0,
          visibility: 0,
          addedBy: "auto",
        },
        {
          id: 2,
          question: `How does ${productName} compare to alternatives?`,
          category: "Feature Comparison",
          region: region,
          aiMentions: 0,
          visibility: 0,
          addedBy: "auto",
        },
        {
          id: 3,
          question: `What are the main features of ${productName}?`,
          category: "Technical",
          region: region,
          aiMentions: 0,
          visibility: 0,
          addedBy: "auto",
        },
      ];
    }

    // Fallback if no competitors generated
    if (competitors.length === 0) {
      console.warn("⚠️ Using fallback competitors (AI generation failed or returned no competitors)");
      competitors = [
        {
          id: 1,
          name: "Competitor A",
          category: category,
          description: `Alternative to ${productName}`,
          visibility: 0,
          mentions: 0,
          citations: 0,
          rank: 1,
        },
      ];
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

    const prompt = `Analyze this websiteUrl and product and provide 5 detailed content optimization recommendations to improve AI visibility and citation weight.

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
