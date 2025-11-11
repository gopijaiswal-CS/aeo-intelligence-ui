# API Reference - Quick Overview

## Base URL
```
http://localhost:3000/api/v1
```

## Endpoints Summary

### 🏥 Health & Status

```
GET /health
```
Check API health status.

---

## 📦 Product APIs

### Generate Products from URL
```http
POST /products/generate
Content-Type: application/json

{
  "websiteUrl": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Product Name",
        "category": "Category",
        "description": "Description"
      }
    ],
    "suggestedRegions": ["us", "eu", "global"]
  }
}
```

---

## 📋 Profile Management APIs

### Create Profile
```http
POST /profiles
Content-Type: application/json

{
  "websiteUrl": "https://example.com",
  "productName": "Product Name",
  "category": "Technology",
  "region": "us"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Product Name Analysis",
    "websiteUrl": "https://example.com",
    "productName": "Product Name",
    "category": "Technology",
    "region": "us",
    "status": "draft",
    "questions": [],
    "competitors": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Profiles
```http
GET /profiles
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profiles": [...],
    "total": 5
  }
}
```

### Get Profile by ID
```http
GET /profiles/:id
```

### Update Profile
```http
PUT /profiles/:id
Content-Type: application/json

{
  "status": "completed",
  "questions": [...],
  "competitors": [...]
}
```

### Delete Profile
```http
DELETE /profiles/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Profile deleted successfully"
  }
}
```

---

## 🔄 Profile Actions

### Generate Questions & Competitors
```http
POST /profiles/:id/generate
```

**Process:**
1. Changes profile status to "generating"
2. Uses Gemini AI to generate 20 questions
3. Uses Gemini AI to identify 5-7 competitors
4. Changes profile status to "ready"

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What are the best...",
        "category": "Product Recommendation",
        "region": "us",
        "aiMentions": 0,
        "visibility": 0,
        "addedBy": "auto"
      }
    ],
    "competitors": [
      {
        "id": 1,
        "name": "Competitor Name",
        "category": "Technology",
        "visibility": 0,
        "mentions": 0,
        "citations": 0,
        "rank": 1
      }
    ]
  }
}
```

### Run AEO Analysis
```http
POST /profiles/:id/analyze
```

**Process:**
1. Changes profile status to "analyzing"
2. Tests questions across multiple LLMs
3. Calculates visibility scores
4. Identifies citation sources
5. Changes profile status to "completed"

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 75,
    "mentions": 180,
    "seoHealth": 88,
    "citations": 65,
    "brokenLinks": 2,
    "trend": [65, 68, 70, 72, 74, 75, 76],
    "citationSources": [
      {
        "url": "techcrunch.com",
        "llm": "ChatGPT",
        "weight": 9.2,
        "mentions": 34
      }
    ],
    "llmPerformance": [
      {
        "name": "ChatGPT",
        "score": 82,
        "mentions": 245,
        "citations": 89
      }
    ]
  }
}
```

---

## 🎯 Optimization APIs

### Get Content Optimization Recommendations
```http
POST /optimize/content
Content-Type: application/json

{
  "profileId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Based on analysis...",
    "projectedScore": 83,
    "recommendations": [
      {
        "priority": "critical",
        "title": "Add Technical Specifications",
        "description": "Include detailed specs...",
        "category": "technical",
        "difficulty": "Easy",
        "impact": "High",
        "improvement": "+8% visibility",
        "actionItems": [
          "Add dimensions",
          "Include compatibility"
        ]
      }
    ]
  }
}
```

---

## 🔍 SEO APIs

### Run SEO Health Check
```http
POST /seo/health-check
Content-Type: application/json

{
  "websiteUrl": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 88,
    "categories": {
      "technicalSeo": {
        "score": 95,
        "status": "excellent",
        "issues": []
      },
      "onPageSeo": {
        "score": 92,
        "status": "excellent",
        "issues": []
      },
      "contentQuality": {
        "score": 78,
        "status": "good",
        "issues": ["Some pages lack depth"]
      },
      "brokenLinks": {
        "score": 60,
        "status": "warning",
        "count": 4
      }
    },
    "actionItems": [
      {
        "priority": "high",
        "title": "Fix Broken Links",
        "description": "4 links need attention"
      }
    ]
  }
}
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 404 | Not Found |
| 500 | Server Error |

---

## ❌ Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request data |
| `NOT_FOUND` | Resource not found |
| `INVALID_URL` | Invalid URL format |
| `INVALID_ID` | Invalid MongoDB ObjectId |
| `INVALID_STATE` | Profile not in correct state |
| `GENERATION_ERROR` | Error generating data |
| `ANALYSIS_ERROR` | Error running analysis |
| `OPTIMIZATION_ERROR` | Error getting recommendations |
| `SEO_CHECK_ERROR` | Error running SEO check |
| `SERVER_ERROR` | Internal server error |
| `DUPLICATE_ERROR` | Duplicate key error |

---

## 🔄 Profile Status Flow

```
draft
  ↓ (POST /profiles/:id/generate)
generating
  ↓ (auto on completion)
ready
  ↓ (POST /profiles/:id/analyze)
analyzing
  ↓ (auto on completion)
completed
```

---

## 📝 Request Headers

All requests should include:
```
Content-Type: application/json
```

Optional (if implementing auth later):
```
Authorization: Bearer <token>
```

---

## 🚀 Complete Workflow Example

```bash
# 1. Generate products from website
curl -X POST http://localhost:3000/api/v1/products/generate \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://example.com"}'

# 2. Create profile
curl -X POST http://localhost:3000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://example.com",
    "productName": "Product Name",
    "category": "Technology",
    "region": "us"
  }'
# Save the "_id" from response

# 3. Generate questions and competitors
curl -X POST http://localhost:3000/api/v1/profiles/PROFILE_ID/generate \
  -H "Content-Type: application/json"

# 4. Run AEO analysis
curl -X POST http://localhost:3000/api/v1/profiles/PROFILE_ID/analyze \
  -H "Content-Type: application/json"

# 5. Get optimization recommendations
curl -X POST http://localhost:3000/api/v1/optimize/content \
  -H "Content-Type: application/json" \
  -d '{"profileId": "PROFILE_ID"}'

# 6. Run SEO health check
curl -X POST http://localhost:3000/api/v1/seo/health-check \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://example.com"}'
```

---

## 🎯 Testing Tips

1. **Use Postman or Thunder Client** for easier testing
2. **Save profile IDs** from responses for subsequent calls
3. **Wait for status changes** before next steps (generating → ready)
4. **Check server logs** for detailed error messages
5. **Test health endpoint first** to verify server is running

---

## 📖 More Documentation

- **Detailed Backend Docs**: `backend/README.md`
- **API Testing Examples**: `backend/API_EXAMPLES.md`
- **Setup Guide**: `BACKEND_SETUP.md`
- **Quick Start**: `QUICK_START.md`

---

**API Version**: 1.0.0
**Last Updated**: November 2025

