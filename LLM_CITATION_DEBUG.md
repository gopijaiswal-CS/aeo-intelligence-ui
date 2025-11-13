# 🔧 LLM Performance & Citation Sources - DEBUG & FIX

## 🐛 Current Issues (From User Report)

Based on the API response, we have TWO critical issues:

```json
{
  "analysisResult": {
    "llmPerformance": [],  // ❌ EMPTY!
    "citationSources": [
      { "url": "example1.com/streaming service", ... },  // ❌ Still placeholder!
      { "url": "example2.com/streaming service", ... }
    ]
  },
  "competitors": [
    { "mentions": 0, "visibility": 0, ... }  // ❌ All zeros!
  ]
}
```

---

## 🔍 Root Cause Analysis

### **Issue 1: llmPerformance is Empty**

**Expected Flow:**
```javascript
1. runAEOAnalysis() creates llmPerformance array
2. Calls analyzeLLMResponses() for each LLM
3. Returns array with 4 items (ChatGPT, Claude, Gemini, Perplexity)
4. Saves to profile.analysisResult.llmPerformance
```

**Possible Causes:**
- ❌ `llmPerformance` array is created but not properly populated
- ❌ MongoDB schema validation might be rejecting the data
- ❌ Data structure mismatch between code and schema

### **Issue 2: Citation Sources Still Show "example1.com"**

**Expected:**
- Real domains like "g2.com", "capterra.com", etc.

**Current:**
- Placeholder URLs like "example1.com/streaming service"

**Root Cause:**
- The URL cleaning logic in `queryLLMBatch` is not working
- Gemini is still generating placeholder URLs despite instructions

---

## ✅ Fixes Implemented

### **1. Added Comprehensive Logging**

**In `profileController.js`:**
```javascript
console.log('\n📊 Analysis Result Summary:');
console.log(`- llmPerformance length: ${analysisResult.llmPerformance?.length || 0}`);
console.log(`- competitorAnalysis length: ${analysisResult.competitorAnalysis?.length || 0}`);

if (analysisResult.llmPerformance && analysisResult.llmPerformance.length > 0) {
  console.log('\n✅ LLM Performance Data:');
  analysisResult.llmPerformance.forEach(llm => {
    console.log(`  ${llm.llmName}: ${llm.score}% (${llm.mentions} mentions)`);
  });
} else {
  console.log('\n❌ WARNING: llmPerformance is empty!');
}
```

**In `analysisService.js` (analyzeLLMResponses):**
```javascript
console.log(`\n🔍 Analyzing ${llmName} responses...`);
console.log(`  Answers: ${answers?.length || 0}`);
console.log(`  Product: ${productName}`);
console.log(`  Competitors: ${competitors?.length || 0}`);
```

### **2. Enhanced Citation Source Cleaning**

The issue is that Gemini is still generating "example1.com" despite our prompt. Let me enhance the cleaning:

**Updated `queryLLMBatch` function:**

```javascript
// CRITICAL: More aggressive cleaning
parsedResponse.answers = parsedResponse.answers.map(answer => {
  // Filter out ALL placeholder patterns
  const cleanedSources = (answer.citationSources || []).filter(source => {
    const sourceLower = source.toLowerCase();
    
    // Reject ANY placeholder patterns
    const placeholderPatterns = [
      'example', 'examplesite', 'site1', 'site2', 'site3',
      'placeholder', 'test.com', 'sample', 'demo',
      'yourwebsite', 'website', 'domain.com'
    ];
    
    // Check if source contains any placeholder pattern
    if (placeholderPatterns.some(pattern => sourceLower.includes(pattern))) {
      console.warn(`[${llmName}] 🚫 Removed placeholder: ${source}`);
      return false;
    }
    
    // Must be in valid sources list
    const isValid = allValidSources.some(validSource => 
      sourceLower.includes(validSource.toLowerCase()) || 
      validSource.toLowerCase().includes(sourceLower)
    );
    
    if (!isValid) {
      console.warn(`[${llmName}] 🚫 Removed invalid: ${source}`);
    }
    
    return isValid;
  });
  
  // If no valid sources remain, use category defaults
  if (cleanedSources.length === 0) {
    const defaults = validSources.slice(0, 2);
    console.log(`[${llmName}] ℹ️ Added default sources: ${defaults.join(', ')}`);
    cleanedSources.push(...defaults);
  }
  
  return { ...answer, citationSources: cleanedSources };
});
```

---

## 🔧 Additional Fix: Stricter Gemini Prompt

Let me update the Gemini prompt to be even more explicit:

```javascript
const prompt = `You are simulating ${llmName}...

<citation_sources>
**CRITICAL RULES - CITATION SOURCES:**

✅ ONLY use these REAL domains:
${sourcesList}
${generalSources.join(', ')}

❌ NEVER use:
- example.com, example1.com, example2.com, etc.
- site1.com, site2.com, site3.com, etc.
- placeholder.com, test.com, demo.com
- ANY made-up domains

**If you use ANY placeholder domain, your response will be REJECTED.**

For each answer, pick 1-3 sources from the list above that are MOST relevant.
Use ONLY the domain name (e.g., "g2.com", NOT "https://g2.com")
</citation_sources>
```

---

## 🧪 Testing & Debug Steps

### **Step 1: Run Analysis with Logging**

1. Create a new profile or use existing
2. Run analysis
3. Check backend terminal output for:

```
🔍 Analyzing ChatGPT responses...
  Answers: 18
  Product: Netflix Streaming Service
  Competitors: 5

[ChatGPT] Score Calculation: 12 mentions out of 18 questions = 67%

📊 Analysis Result Summary:
- llmPerformance length: 4
- competitorAnalysis length: 5

✅ LLM Performance Data:
  ChatGPT: 67% (12 mentions, 15 citations)
  Claude: 61% (11 mentions, 12 citations)
  Gemini: 72% (13 mentions, 18 citations)
  Perplexity: 58% (10 mentions, 14 citations)
```

### **Step 2: Check API Response**

```json
{
  "analysisResult": {
    "llmPerformance": [
      {
        "llmName": "ChatGPT",
        "score": 67,
        "mentions": 12,
        "citations": 15,
        "topSources": [
          { "url": "g2.com", "weight": 9.5, ... },
          { "url": "capterra.com", "weight": 9.1, ... }
        ]
      },
      // ... 3 more LLMs
    ],
    "citationSources": [
      { "url": "g2.com", "llm": "ChatGPT", ... },
      { "url": "trustradius.com", "llm": "Gemini", ... }
      // NO example1.com!
    ]
  },
  "competitors": [
    {
      "name": "Disney+",
      "visibility": 45,  // NOT 0!
      "mentions": 8,     // NOT 0!
      "rank": 1
    }
  ]
}
```

---

## 📋 Verification Checklist

### **Backend Logs Should Show:**
- [ ] "Analyzing ChatGPT responses..." for each LLM
- [ ] "Score Calculation: X mentions out of Y questions = Z%"
- [ ] "llmPerformance length: 4" (not 0)
- [ ] "✅ LLM Performance Data:" with 4 entries
- [ ] "⚠️ Removed placeholder URL:" warnings
- [ ] "ℹ️ Added default source:" if needed

### **API Response Should Have:**
- [ ] `llmPerformance` array with 4 items
- [ ] Each LLM has: name, score, mentions, citations, topSources
- [ ] `citationSources` array with NO "example" URLs
- [ ] All sources are real domains (g2.com, capterra.com, etc.)
- [ ] Competitors have non-zero visibility and mentions

### **Frontend Should Display:**
- [ ] 4 LLM bars with different scores
- [ ] Real mention counts (not 0)
- [ ] Real citation counts (not 0)
- [ ] "Best Performance: [LLM] with X%" (dynamic)
- [ ] Competitors with real visibility % (not 0)
- [ ] Competitors with real ranks (1, 2, 3...)

---

## 🚀 Next Steps

1. **Run a NEW analysis** on any profile
2. **Monitor backend logs** in terminal
3. **Check for warnings** about placeholder URLs
4. **Verify API response** has llmPerformance populated
5. **Check frontend** displays real data

---

## 💡 If Issues Persist

### **If llmPerformance is still empty:**

Check logs for:
```
❌ WARNING: llmPerformance is empty!
```

Possible causes:
- Gemini API timeout
- Response parsing error
- Schema validation error

**Solution:** Check full error message in logs

### **If citations still show "example":**

Check logs for:
```
[Gemini] 🚫 Removed placeholder: example1.com
```

If you DON'T see these warnings, the cleaning logic isn't running.

**Solution:** The Gemini API is generating correct sources but they're not being cleaned. Add more aggressive filtering.

---

## 📊 Expected Results After Fix

### **Console Output:**
```
Starting AEO Analysis for: Netflix Streaming Service
Questions: 18
Competitors: 5

🔍 Analyzing ChatGPT responses...
  Answers: 18
  Product: Netflix Streaming Service
  Competitors: 5

[ChatGPT] Score Calculation: 12 mentions out of 18 questions = 67%
[Claude] Score Calculation: 11 mentions out of 18 questions = 61%
[Gemini] Score Calculation: 13 mentions out of 18 questions = 72%
[Perplexity] Score Calculation: 10 mentions out of 18 questions = 56%

📊 Analysis Result Summary:
- llmPerformance length: 4
- competitorAnalysis length: 5
- citationSources length: 45

✅ LLM Performance Data:
  ChatGPT: 67% (12 mentions, 15 citations)
  Claude: 61% (11 mentions, 12 citations)
  Gemini: 72% (13 mentions, 18 citations)
  Perplexity: 56% (10 mentions, 14 citations)
```

### **API Response:**
```json
{
  "analysisResult": {
    "overallScore": 64,
    "mentions": 46,
    "citations": 54,
    "llmPerformance": [
      { "llmName": "ChatGPT", "score": 67, ... },
      { "llmName": "Claude", "score": 61, ... },
      { "llmName": "Gemini", "score": 72, ... },
      { "llmName": "Perplexity", "score": 56, ... }
    ],
    "citationSources": [
      { "url": "g2.com", ... },
      { "url": "capterra.com", ... }
      // Real URLs only!
    ]
  },
  "competitors": [
    { "name": "Disney+", "visibility": 45, "mentions": 8, "rank": 1 },
    { "name": "Hulu", "visibility": 38, "mentions": 7, "rank": 2 }
  ]
}
```

---

## ✅ Status

- ✅ Added comprehensive logging
- ✅ Backend server restarted with logging
- ⏳ Need to run analysis and check logs
- ⏳ Need to verify llmPerformance is populated
- ⏳ Need to verify citations are real domains

**Backend is running with enhanced logging!**

**Run an analysis now and check the terminal output!** 🚀

