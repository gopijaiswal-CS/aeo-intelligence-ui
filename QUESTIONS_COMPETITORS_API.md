# 🤖 Questions & Competitors Generation API

## Overview
Implemented AI-powered generation of questions and competitors using Gemini AI, similar to the product generation API.

---

## 📁 Files Created/Modified

### 1. **New Prompt Template**
**File**: `backend/src/prompts/generateQuestionsAndCompetitors.js`

**Purpose**: Comprehensive prompt template for Gemini AI to generate:
- 15-20 diverse questions across 8 categories
- 5-8 main competitors with descriptions

**Features**:
- Structured prompt with clear instructions
- Examples for different product types
- Guidelines for natural, conversational questions
- Regional preference consideration
- Output format specification

---

### 2. **Updated Gemini Service**
**File**: `backend/src/services/geminiService.js`

**Changes**:
- Imported new prompt template
- Updated `generateQuestionsAndCompetitors()` function
- Uses comprehensive single prompt instead of separate calls
- Better JSON parsing with multiple fallback strategies
- Includes default fallback data if AI fails

**Function Signature**:
```javascript
async function generateQuestionsAndCompetitors(
  productName,
  category,
  region,
  websiteUrl = ''
)
```

---

### 3. **Updated Profile Controller**
**File**: `backend/src/controllers/profileController.js`

**Changes**:
- Added `websiteUrl` parameter to service call
- Passes complete context to AI for better generation

---

## 🎯 API Endpoint

### Generate Questions & Competitors
```
POST /api/v1/profiles/:id/generate
```

**Description**: Generates questions and competitors for an existing profile using Gemini AI.

**Request**:
```json
POST /api/v1/profiles/507f1f77bcf86cd799439011/generate
```

**Response**:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What is the best smartphone for photography in 2024?",
        "category": "Product Recommendation",
        "region": "us",
        "aiMentions": 0,
        "visibility": 0,
        "addedBy": "auto"
      },
      {
        "id": 2,
        "question": "How does iPhone 15 Pro compare to Samsung Galaxy S24?",
        "category": "Feature Comparison",
        "region": "us",
        "aiMentions": 0,
        "visibility": 0,
        "addedBy": "auto"
      }
      // ... more questions
    ],
    "competitors": [
      {
        "id": 1,
        "name": "Samsung Galaxy S24",
        "category": "Smartphones",
        "description": "Flagship Android smartphone with advanced camera and AI features",
        "visibility": 0,
        "mentions": 0,
        "citations": 0,
        "rank": 1
      },
      {
        "id": 2,
        "name": "Google Pixel 8 Pro",
        "category": "Smartphones",
        "description": "Premium smartphone with pure Android experience",
        "visibility": 0,
        "mentions": 0,
        "citations": 0,
        "rank": 2
      }
      // ... more competitors
    ]
  }
}
```

---

## 📊 Question Categories

The AI generates questions across 8 categories:

1. **Product Recommendation** - "What's the best X for Y?"
2. **Feature Comparison** - "How does X compare to Y?"
3. **How-To** - "How do I use X for Y?"
4. **Technical** - "What are the specs of X?"
5. **Price Comparison** - "Is X worth the price?"
6. **Security** - "Is X secure?"
7. **Use Case** - "Can I use X for Y?"
8. **Compatibility** - "Does X work with Y?"

---

## 🏆 Competitor Information

For each competitor, the API provides:
- **Name**: Competitor product/brand name
- **Category**: Same category as the main product
- **Description**: Brief 1-sentence description
- **Metrics**: Visibility, mentions, citations (initialized to 0)
- **Rank**: Position in competitor list

---

## 🔄 Workflow

1. **Profile Created** → Status: `draft`
2. **Generate Called** → Status: `generating`
3. **AI Processing** → Gemini generates questions & competitors
4. **Data Saved** → Profile updated with results
5. **Complete** → Status: `ready`

---

## 🎨 Prompt Features

### Comprehensive Instructions:
- ✅ Generate 15-20 diverse questions
- ✅ Cover all 8 question categories evenly
- ✅ Use natural, conversational language
- ✅ Reflect real user queries
- ✅ Consider regional preferences
- ✅ Include specific examples

### Competitor Analysis:
- ✅ Identify 5-8 main competitors
- ✅ Focus on direct alternatives
- ✅ Provide brief descriptions
- ✅ Consider market positioning
- ✅ Regional availability

### Context-Aware:
- Uses product name, category, region
- Considers company website
- Leverages AI's market knowledge
- Generates relevant, timely questions

---

## 🛡️ Error Handling

### Fallback Strategies:
1. **JSON Parsing Fails** → Try multiple regex patterns
2. **No Questions Generated** → Use 3 default questions
3. **No Competitors Generated** → Use 1 default competitor
4. **AI Error** → Return error with status reset

### Status Management:
- Profile status updated throughout process
- Automatic status reset on error
- Clear error messages returned

---

## 🚀 Usage Example

```javascript
// Frontend call
const response = await api.generateQuestionsAndCompetitors(profileId);

if (response.success) {
  const { questions, competitors } = response.data;
  console.log(`Generated ${questions.length} questions`);
  console.log(`Found ${competitors.length} competitors`);
}
```

---

## 📝 Testing

### Test with different products:
```bash
# iPhone
POST /api/v1/profiles/:id/generate
# Profile: productName="iPhone 15 Pro", category="Smartphones", region="us"

# MacBook
POST /api/v1/profiles/:id/generate
# Profile: productName="MacBook Pro", category="Laptops", region="us"

# Tesla
POST /api/v1/profiles/:id/generate
# Profile: productName="Tesla Model 3", category="Electric Vehicles", region="us"
```

---

## ✅ Benefits

1. **Single API Call** - Gets both questions and competitors
2. **AI-Powered** - Uses Gemini 2.5 Flash for intelligent generation
3. **Context-Aware** - Considers product, category, region, website
4. **Diverse Output** - Covers multiple question types
5. **Realistic Data** - Generates natural, user-like questions
6. **Market Intelligence** - Identifies real competitors
7. **Robust Fallbacks** - Always returns data, even if AI fails

---

## 🎯 Result

**Questions & Competitors API is now fully implemented and integrated!** 🎊

The API uses a comprehensive prompt template similar to the product generation, ensuring:
- High-quality, diverse questions
- Accurate competitor identification
- Natural language output
- Robust error handling
- Consistent response format

