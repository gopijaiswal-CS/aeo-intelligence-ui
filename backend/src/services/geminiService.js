const {
  generateContent,
  generateJSONContent,
  getDefaultProvider,
} = require("../config/llm");
const axios = require("axios");
const cheerio = require("cheerio");
const { generateProductsList } = require("../prompts/generateProductsList");
const {
  generateQuestionsAndCompetitors: generateQCPrompt,
} = require("../prompts/generateQuestionsAndCompetitors");

/**
 * Safely extract and parse JSON from LLM response
 * Handles markdown code blocks, XML tags, and raw JSON
 */
function extractJSON(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: text must be a non-empty string");
  }

  // Try different extraction patterns
  const patterns = [
    // Markdown code blocks with json language tag
    /```json\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/,
    // Markdown code blocks without language tag
    /```\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/,
    // XML-style tags
    /<json>\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*<\/json>/,
    // Raw JSON object with specific keys
    /\{[\s\S]*?"(?:products|questions|competitors)"[\s\S]*?\}/,
    // Raw JSON array
    /\[[\s\S]*?\]/,
    // Raw JSON object (fallback)
    /\{[\s\S]*?\}/,
  ];

  let jsonText = null;

  // Try each pattern
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      jsonText = match[1] || match[0];
      break;
    }
  }

  // If no pattern matched, try to use the entire text
  if (!jsonText) {
    jsonText = text.trim();
  }

  // Clean up the extracted text
  jsonText = jsonText
    .replace(/```json|```/g, "") // Remove markdown
    .replace(/<\/?json>/g, "") // Remove XML tags
    .trim();

  // Validate that it looks like JSON
  if (!jsonText.startsWith("{") && !jsonText.startsWith("[")) {
    throw new Error(
      "Extracted text does not appear to be valid JSON (must start with { or [)"
    );
  }

  // Attempt to parse
  try {
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    // Provide more context in the error
    const preview =
      jsonText.length > 200 ? jsonText.substring(0, 200) + "..." : jsonText;
    throw new Error(
      `Failed to parse JSON: ${error.message}\nExtracted text preview: ${preview}`
    );
  }
}

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
    const prompt = generateProductsList(normalizedUrl);

    // Use unified LLM service (defaults to OpenAI)
    const text = await generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
      provider: "openai",
      model: "gpt-4o",
    });

    // Extract JSON from response
    let products = [];
    try {
      console.log("Raw LLM response for products:", text.substring(0, 500));

      // Use safe JSON extraction
      const parsedData = extractJSON(text);
      console.log("Successfully parsed products data:", parsedData);

      // Handle both formats: {"products": [...]} and [...]
      const productsList = parsedData.products || parsedData;

      if (!Array.isArray(productsList)) {
        throw new Error(
          "Parsed data is not an array and does not contain a 'products' array"
        );
      }

      // Convert to our format
      products = productsList.map((product, index) => ({
        id: index + 1,
        name: typeof product === "string" ? product : product.name || product,
        category: product.category || "General",
        description: product.description || `${product} product or service`,
      }));

      console.log(`Successfully extracted ${products.length} products`);
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError.message);
      console.error("Raw response (first 500 chars):", text.substring(0, 500));

      // Fallback: try to extract product names from text
      const productNames = text.match(/"([^"]+)"/g);
      if (productNames && productNames.length > 0) {
        console.log("Using fallback: extracted product names from text");
        products = productNames.slice(0, 5).map((name, index) => ({
          id: index + 1,
          name: name.replace(/"/g, ""),
          category: "General",
          description: "Extracted from website analysis",
        }));
      } else {
        // Last resort fallback
        console.log("Using last resort: default product");
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
async function generateQuestionsAndCompetitors(
  productName,
  category,
  region,
  websiteUrl = ""
) {
  try {
    // Use the comprehensive prompt template
    const prompt = generateQCPrompt(productName, category, region, websiteUrl);

    // Use unified LLM service (defaults to OpenAI)
    const text = await generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    let questions = [];
    let competitors = [];

    try {
      console.log(
        "Raw LLM response for questions/competitors:",
        text.substring(0, 500)
      );

      // Use safe JSON extraction
      const parsedData = extractJSON(text);
      console.log("Successfully parsed questions/competitors data");

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
        console.log(`✅ Extracted ${questions.length} questions`);
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
        console.log(`✅ Extracted ${competitors.length} competitors`);
      } else {
        console.warn("⚠️ No competitors array found in parsed data");
      }
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError.message);
      console.error("Raw response (first 500 chars):", text.substring(0, 500));
    }

    // Fallback if no questions generated
    if (questions.length === 0) {
      console.warn(
        "⚠️ Using fallback questions (AI generation failed or returned no questions)"
      );
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
      console.warn(
        "⚠️ Using fallback competitors (AI generation failed or returned no competitors)"
      );
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

    // Use unified LLM service (defaults to OpenAI)
    const text = await generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    let recommendations = [];
    let summary = "AI-powered analysis completed successfully.";
    let projectedScore = (profileData.analysisResult?.overallScore || 65) + 12;

    try {
      console.log(
        "Raw LLM response for recommendations:",
        text.substring(0, 500)
      );

      // Use safe JSON extraction
      const parsedData = extractJSON(text);

      // Handle both array and object with recommendations key
      if (Array.isArray(parsedData)) {
        recommendations = parsedData;
      } else if (
        parsedData.recommendations &&
        Array.isArray(parsedData.recommendations)
      ) {
        recommendations = parsedData.recommendations;
      } else {
        console.warn("⚠️ No recommendations array found in parsed data");
      }

      console.log(`✅ Extracted ${recommendations.length} recommendations`);

      // Extract summary if present
      const summaryMatch = text.match(/summary[:\s]+([^\n]+)/i);
      if (summaryMatch) {
        summary = summaryMatch[1];
      }
    } catch (parseError) {
      console.error(
        "❌ Recommendations JSON parsing error:",
        parseError.message
      );
      console.error("Raw response (first 500 chars):", text.substring(0, 500));
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
