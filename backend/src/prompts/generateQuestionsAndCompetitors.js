export const generateQuestionsAndCompetitors = (productName, category, region, websiteUrl) => `
<task>
  You are an AEO (Answer Engine Optimization) intelligence assistant.
  Given a product name, category, and region, generate:
  1. Generic industry/category questions that users ask when researching this type of product
  2. Top real-world competitors of this specific product in the market
</task>

<context>
  Product: ${productName}
  Category: ${category}
  Region: ${region}
  Company Website: ${websiteUrl}
  
  The company operates in the ${category} space and wants to understand:
  - What generic 15-20 questions people ask when researching ${category} products
  - Who are the top 5 competitors for ${productName} in the ${region} market
</context>

<instructions>
  
  ## PART 1: Generate Generic Questions
  
  Generate 15-20 GENERIC questions that users ask AI assistants when researching ${category} products.
  
  **IMPORTANT**: Questions should be GENERIC about the category, NOT specific to ${productName}.
  
  Examples of GENERIC questions (Good ✅):
  - "What is the best CRM software for small business?"
  - "How to choose a CRM system?"
  - "Top CRM tools in 2024"
  - "CRM software comparison"
  - "What features should a CRM have?"
  
  Examples of SPECIFIC questions (Bad ❌):
  - "What is Salesforce?" (too specific)
  - "How to use HubSpot?" (too specific)
  
  Question Categories (distribute evenly):
  1. Product Recommendation - "What is the best [category] for [use case]?"
  2. Feature Comparison - "How to compare [category] tools?"
  3. How-To - "How to choose/implement [category]?"
  4. Technical - "What are key features of [category]?"
  5. Price Comparison - "How much does [category] cost?"
  6. Security - "Is [category] secure?"
  7. Use Case - "Best [category] for [industry/size]?"
  8. Compatibility - "Does [category] integrate with [tool]?"
  
  ## PART 2: Identify Real Competitors
  
  Identify 5 TOP REAL-WORLD competitors for ${productName} in the ${category} market.
  
  **IMPORTANT**: 
  - List ACTUAL competing products/brands in the market
  - Focus on direct competitors (same category, same target market)
  - Consider regional availability (${region} market)
  - Include market leaders and strong alternatives
  
  For each competitor provide:
  - Name (actual product/brand name)
  - Category (same as ${category})
  - Brief description (1 sentence about what makes them a competitor)
  
  Examples:
  - If product is "Salesforce" in CRM: HubSpot, Zoho CRM, Microsoft Dynamics, Pipedrive
  - If product is "iPhone" in Smartphones: Samsung Galaxy, Google Pixel, OnePlus, Xiaomi
  - If product is "Slack" in Team Communication: Microsoft Teams, Discord, Zoom, Google Chat
</instructions>

<output_format>
  Return ONLY valid JSON in this exact format:
  
  {
    "questions": [
      {
        "id": 1,
        "question": "What is the best CRM software for small business?",
        "category": "Product Recommendation",
        "region": "us"
      },
      {
        "id": 2,
        "question": "How to choose the right CRM system?",
        "category": "How-To",
        "region": "us"
      },
      {
        "id": 3,
        "question": "CRM software comparison 2024",
        "category": "Feature Comparison",
        "region": "us"
      }
    ],
    "competitors": [
      {
        "id": 1,
        "name": "HubSpot CRM",
        "category": "CRM Software",
        "description": "All-in-one CRM platform with marketing automation and sales tools"
      },
      {
        "id": 2,
        "name": "Zoho CRM",
        "category": "CRM Software",
        "description": "Affordable CRM solution with extensive customization options"
      },
      {
        "id": 3,
        "name": "Microsoft Dynamics 365",
        "category": "CRM Software",
        "description": "Enterprise CRM integrated with Microsoft ecosystem"
      }
    ]
  }
</output_format>

<examples>
  
  <example_1>
    Input: 
    - Product: "Salesforce"
    - Category: "CRM Software"
    - Region: "us"
    
    Questions (Generic about CRM, not Salesforce):
    1. "What is the best CRM software for small business?"
    2. "How to choose a CRM system?"
    3. "Top CRM tools in 2024"
    4. "CRM software comparison"
    5. "How much does CRM software cost?"
    6. "What features should a CRM have?"
    7. "Best CRM for startups"
    8. "Is cloud-based CRM secure?"
    9. "CRM integration with email marketing"
    10. "How to implement CRM in my business?"
    
    Competitors (Real Salesforce competitors):
    1. HubSpot CRM
    2. Zoho CRM
    3. Microsoft Dynamics 365
    4. Pipedrive
    5. Freshsales
  </example_1>
  
  <example_2>
    Input:
    - Product: "iPhone 15 Pro"
    - Category: "Smartphones"
    - Region: "us"
    
    Questions (Generic about smartphones, not iPhone):
    1. "What is the best smartphone for photography?"
    2. "How to choose a smartphone in 2024?"
    3. "Smartphone comparison guide"
    4. "Best smartphones under $1000"
    5. "Which smartphone has the best camera?"
    6. "5G smartphones comparison"
    7. "Best smartphone for gaming"
    8. "How long do smartphones last?"
    
    Competitors (Real iPhone competitors):
    1. Samsung Galaxy S24 Ultra
    2. Google Pixel 8 Pro
    3. OnePlus 12
    4. Xiaomi 14 Pro
    5. Sony Xperia 1 V
  </example_2>
  
  <example_3>
    Input:
    - Product: "Slack"
    - Category: "Team Communication"
    - Region: "us"
    
    Questions (Generic about team communication, not Slack):
    1. "What is the best team communication tool?"
    2. "How to improve team collaboration?"
    3. "Team chat software comparison"
    4. "Best communication tools for remote teams"
    5. "How to choose team collaboration software?"
    
    Competitors (Real Slack competitors):
    1. Microsoft Teams
    2. Discord
    3. Zoom Team Chat
    4. Google Chat
    5. Mattermost
  </example_3>
  
</examples>

<guidelines>
  
  ## For Questions:
  - Use GENERIC language about the category, not the specific product
  - Questions should apply to ANY product in the category
  - Reflect real user search intent and research patterns
  - Include both broad and specific use cases
  - Consider different user segments (small business, enterprise, etc.)
  - Use natural, conversational language
  - Questions should be what people ask BEFORE choosing a specific product
  
  ## For Competitors:
  - List REAL products/brands that compete in the same market
  - Focus on direct competitors (not complementary products)
  - Consider market positioning (enterprise vs SMB, premium vs budget)
  - Include both established leaders and strong challengers
  - Ensure regional availability (some products stronger in certain regions)
  - Provide context on why they're competitors
  
</guidelines>

<note>
  The goal is to understand:
  1. What generic questions people ask when researching this CATEGORY of products
  2. Which actual products/brands compete with ${productName} in the market
  
  This helps companies understand how they appear in AI responses when users research their product category.
</note>
`;
