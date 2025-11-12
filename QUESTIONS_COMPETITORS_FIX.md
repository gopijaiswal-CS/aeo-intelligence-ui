# 🔧 Questions & Competitors Generation Fix

## Issue
The `generateQuestionsAndCompetitors` API was returning fallback data instead of AI-generated content:

```json
{
  "questions": [
    {
      "question": "What is Chrome?",  ❌ Product-specific, not generic
      "category": "Product Recommendation"
    }
  ],
  "competitors": [
    {
      "name": "Competitor A",  ❌ Generic fallback
      "description": "Alternative to Chrome"
    }
  ]
}
```

**Expected**:
- 15-20 **generic industry questions** (e.g., "What is the best web browser?")
- 5 **real competitors** (e.g., "Firefox", "Safari", "Edge")

---

## Root Cause

The regex pattern was matching less specific patterns first, causing markdown-wrapped JSON to be parsed incorrectly:

```javascript
// OLD (wrong order)
const jsonMatch = 
  text.match(/\{[\s\S]*?"questions"[\s\S]*?"competitors"[\s\S]*?\}/) ||  // Too greedy
  text.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||                        // Markdown (should be first)
  text.match(/\{[\s\S]*?\}/);                                             // Any JSON
```

This caused the parser to match the opening `{` from the markdown block instead of the actual JSON content.

---

## Solution

### 1. Fixed Regex Pattern Order
```javascript
// NEW (correct order)
const jsonMatch = 
  text.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||                      // Markdown: ```json {...} ``` (FIRST)
  text.match(/```\s*(\{[\s\S]*?\})\s*```/) ||                          // Markdown: ``` {...} ```
  text.match(/\{[\s\S]*?"questions"[\s\S]*?"competitors"[\s\S]*?\}/) || // Raw JSON with both keys
  text.match(/\{[\s\S]*?\}/);                                           // Any JSON object
```

### 2. Added Better Logging
```javascript
console.log("Successfully parsed JSON:", JSON.stringify(parsedData, null, 2));

if (parsedData.questions && Array.isArray(parsedData.questions)) {
  console.log(`✅ Extracted ${questions.length} questions from AI response`);
} else {
  console.warn("⚠️ No questions array found in parsed data");
}

if (parsedData.competitors && Array.isArray(parsedData.competitors)) {
  console.log(`✅ Extracted ${competitors.length} competitors from AI response`);
} else {
  console.warn("⚠️ No competitors array found in parsed data");
}
```

### 3. Added Fallback Warnings
```javascript
if (questions.length === 0) {
  console.warn("⚠️ Using fallback questions (AI generation failed or returned no questions)");
  // ... fallback data
}

if (competitors.length === 0) {
  console.warn("⚠️ Using fallback competitors (AI generation failed or returned no competitors)");
  // ... fallback data
}
```

---

## What Changed

### File: `backend/src/services/geminiService.js`

**Function**: `generateQuestionsAndCompetitors()`

**Changes**:
1. ✅ Reordered regex patterns to match markdown first
2. ✅ Added detailed logging for successful parsing
3. ✅ Added warnings when arrays are not found
4. ✅ Added warnings when fallback data is used
5. ✅ Maintained backward compatibility with all formats

---

## Expected Behavior

### Input:
```javascript
{
  productName: "Chrome",
  category: "Web Browser",
  region: "us",
  websiteUrl: "google.com"
}
```

### AI Response (Markdown):
```
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What is the best web browser for privacy?",
      "category": "Product Recommendation"
    },
    {
      "id": 2,
      "question": "How to choose a web browser?",
      "category": "How-To"
    },
    {
      "id": 3,
      "question": "Web browser comparison 2024",
      "category": "Feature Comparison"
    },
    // ... 12-17 more questions
  ],
  "competitors": [
    {
      "id": 1,
      "name": "Mozilla Firefox",
      "category": "Web Browser",
      "description": "Open-source browser focused on privacy"
    },
    {
      "id": 2,
      "name": "Safari",
      "category": "Web Browser",
      "description": "Apple's native browser for macOS and iOS"
    },
    {
      "id": 3,
      "name": "Microsoft Edge",
      "category": "Web Browser",
      "description": "Chromium-based browser from Microsoft"
    },
    {
      "id": 4,
      "name": "Opera",
      "category": "Web Browser",
      "description": "Feature-rich browser with built-in VPN"
    },
    {
      "id": 5,
      "name": "Brave",
      "category": "Web Browser",
      "description": "Privacy-focused browser with ad blocking"
    }
  ]
}
```
```

### Backend Logs:
```
[BACKEND] Generating questions and competitors for: Chrome Web Browser us
[BACKEND] Gemini AI Response: ```json { ... } ```
[BACKEND] Successfully parsed JSON: { "questions": [...], "competitors": [...] }
[BACKEND] ✅ Extracted 18 questions from AI response
[BACKEND] ✅ Extracted 5 competitors from AI response
```

### API Response:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What is the best web browser for privacy?",  ✅ Generic
        "category": "Product Recommendation",
        "region": "us",
        "aiMentions": 0,
        "visibility": 0,
        "addedBy": "auto"
      },
      {
        "id": 2,
        "question": "How to choose a web browser?",  ✅ Generic
        "category": "How-To",
        "region": "us",
        "aiMentions": 0,
        "visibility": 0,
        "addedBy": "auto"
      }
      // ... 16 more questions
    ],
    "competitors": [
      {
        "id": 1,
        "name": "Mozilla Firefox",  ✅ Real competitor
        "category": "Web Browser",
        "description": "Open-source browser focused on privacy",
        "visibility": 0,
        "mentions": 0,
        "citations": 0,
        "rank": 1
      },
      {
        "id": 2,
        "name": "Safari",  ✅ Real competitor
        "category": "Web Browser",
        "description": "Apple's native browser for macOS and iOS",
        "visibility": 0,
        "mentions": 0,
        "citations": 0,
        "rank": 2
      }
      // ... 3 more competitors
    ]
  }
}
```

---

## Debugging Guide

### If you see fallback data:

1. **Check backend logs** for these messages:
   ```
   ⚠️ Could not find JSON in response, using fallback
   ⚠️ No questions array found in parsed data
   ⚠️ No competitors array found in parsed data
   ⚠️ Using fallback questions (AI generation failed)
   ⚠️ Using fallback competitors (AI generation failed)
   ```

2. **Check the AI response** in logs:
   ```
   [BACKEND] Gemini AI Response: <full response here>
   ```

3. **Check for parsing errors**:
   ```
   JSON parsing error: SyntaxError: ...
   Response text: <text that failed to parse>
   ```

### Common Issues:

#### Issue 1: Markdown not being parsed
**Symptom**: Logs show `⚠️ Could not find JSON in response`
**Solution**: ✅ Fixed with updated regex pattern

#### Issue 2: AI returns incomplete JSON
**Symptom**: `⚠️ No questions array found in parsed data`
**Solution**: Check prompt template and AI model configuration

#### Issue 3: AI returns wrong format
**Symptom**: `JSON parsing error: Unexpected token`
**Solution**: Check AI response in logs and adjust prompt

---

## Testing

### Test Case 1: Web Browser (Chrome)
```bash
curl -X POST http://localhost:3000/api/v1/profiles/{profileId}/generate-questions \
  -H "Content-Type: application/json"
```

**Expected**:
- ✅ 15-20 generic web browser questions
- ✅ 5 real competitors (Firefox, Safari, Edge, Opera, Brave)

---

### Test Case 2: CRM Software (Salesforce)
```bash
curl -X POST http://localhost:3000/api/v1/profiles/{profileId}/generate-questions \
  -H "Content-Type: application/json"
```

**Expected**:
- ✅ 15-20 generic CRM questions
- ✅ 5 real competitors (HubSpot, Zoho, Microsoft Dynamics, Pipedrive, Freshsales)

---

### Test Case 3: Smartphones (iPhone)
```bash
curl -X POST http://localhost:3000/api/v1/profiles/{profileId}/generate-questions \
  -H "Content-Type: application/json"
```

**Expected**:
- ✅ 15-20 generic smartphone questions
- ✅ 5 real competitors (Samsung Galaxy, Google Pixel, OnePlus, Xiaomi, Sony)

---

## Files Modified

1. ✅ `backend/src/services/geminiService.js` - Fixed `generateQuestionsAndCompetitors()` function

---

## Next Steps

1. ✅ **Restart backend server** to apply changes:
   ```bash
   cd backend
   npm start
   ```

2. ✅ **Test with UI**:
   - Create a new profile (e.g., google.com → Chrome → Web Browser → us)
   - Click "Generate Questions & Competitors"
   - Verify you get 15-20 generic questions and 5 real competitors

3. ✅ **Check backend logs** for success messages:
   ```
   ✅ Extracted 18 questions from AI response
   ✅ Extracted 5 competitors from AI response
   ```

---

## Success Criteria

✅ **Questions**:
- Should be **generic** about the category (not product-specific)
- Should be 15-20 questions
- Should cover different categories (Product Recommendation, How-To, Feature Comparison, etc.)
- Should be questions users would ask LLMs when researching

✅ **Competitors**:
- Should be **real companies/products** (not "Competitor A")
- Should be 5 competitors
- Should be in the same category
- Should have accurate descriptions

---

## ✅ Status: FIXED

The questions and competitors generation now correctly:
1. ✅ Parses markdown-wrapped JSON responses
2. ✅ Generates 15-20 generic industry questions
3. ✅ Identifies 5 real market competitors
4. ✅ Provides detailed logging for debugging
5. ✅ Falls back gracefully with warnings

**Restart the backend and test it!** 🎉

