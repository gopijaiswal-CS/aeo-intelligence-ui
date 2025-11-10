# AEO Intelligence - API Integration Guide

This document outlines all API endpoints needed to replace mock data with real backend integration.

## Table of Contents
1. [Authentication](#authentication)
2. [Profile Management](#profile-management)
3. [Product Generation](#product-generation)
4. [Question & Competitor Generation](#question--competitor-generation)
5. [AEO Analysis Engine](#aeo-analysis-engine)
6. [Content Optimization](#content-optimization)
7. [SEO Health Check](#seo-health-check)
8. [LLM Insights](#llm-insights)
9. [Reports](#reports)

---

## Authentication

### Base URL
```
https://api.aeo-intelligence.com/v1
```

### Headers
All authenticated requests should include:
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY",
  "X-API-Version": "1.0"
}
```

---

## 1. Profile Management

### Create Profile
**Endpoint:** `POST /profiles`

**Request Body:**
```json
{
  "websiteUrl": "https://example.com",
  "productName": "Smart Speaker Pro",
  "category": "Smart Home",
  "region": "us"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prof_abc123",
    "name": "Smart Speaker Pro Analysis",
    "websiteUrl": "https://example.com",
    "productName": "Smart Speaker Pro",
    "category": "Smart Home",
    "region": "us",
    "status": "draft",
    "createdAt": "2025-01-15T10:30:00Z",
    "lastUpdated": "2025-01-15T10:30:00Z"
  }
}
```

**Implementation Location:**
- File: `src/contexts/ProfileContext.tsx`
- Function: `createProfile()`
- Line: ~50

**Code Example:**
```typescript
const createProfile = async (data: CreateProfileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create profile');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};
```

---

### Get All Profiles
**Endpoint:** `GET /profiles`

**Query Parameters:**
- `status` (optional): Filter by status (draft, generating, ready, analyzing, completed)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "prof_abc123",
        "name": "Smart Speaker Pro Analysis",
        "productName": "Smart Speaker Pro",
        "websiteUrl": "https://example.com",
        "category": "Smart Home",
        "region": "us",
        "status": "completed",
        "createdAt": "2025-01-15T10:30:00Z",
        "lastUpdated": "2025-01-15T12:45:00Z",
        "analysisResult": {
          "overallScore": 76,
          "mentions": 245,
          "seoHealth": 88,
          "citations": 89,
          "brokenLinks": 4
        }
      }
    ],
    "total": 15,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Update Profile
**Endpoint:** `PUT /profiles/{profileId}`

**Request Body:**
```json
{
  "questions": [...],
  "competitors": [...],
  "status": "ready"
}
```

---

### Delete Profile
**Endpoint:** `DELETE /profiles/{profileId}`

**Response:**
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

## 2. Product Generation

### Generate Products from Website
**Endpoint:** `POST /products/generate`

**Request Body:**
```json
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
        "name": "Smart Speaker Pro",
        "category": "Smart Home",
        "description": "AI-powered smart speaker with voice assistant"
      },
      {
        "id": 2,
        "name": "Wireless Camera X",
        "category": "Security",
        "description": "HD security camera with night vision"
      }
    ],
    "suggestedRegions": ["us", "eu", "global"]
  }
}
```

**Implementation Location:**
- File: `src/pages/CreateProfile.tsx`
- Function: `handleGenerateProducts()`
- Line: ~109

**Code Example:**
```typescript
const handleGenerateProducts = async () => {
  if (!websiteUrl || !isValidUrl(websiteUrl)) {
    toast.error("Please enter a valid website URL");
    return;
  }

  setIsGenerating(true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ websiteUrl })
    });
    
    const result = await response.json();
    
    if (result.success) {
      setGeneratedProducts(result.data.products);
      setCurrentStep(2);
      toast.success("Products generated successfully!");
    } else {
      toast.error("Failed to generate products");
    }
  } catch (error) {
    toast.error("Error generating products");
  } finally {
    setIsGenerating(false);
  }
};
```

---

## 3. Question & Competitor Generation

### Generate Questions and Competitors
**Endpoint:** `POST /profiles/{profileId}/generate`

**Request Body:**
```json
{
  "productName": "Smart Speaker Pro",
  "category": "Smart Home",
  "region": "us"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What are the best smart speakers for home automation?",
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
        "name": "Echo Dot",
        "category": "Smart Home",
        "visibility": 0,
        "mentions": 0,
        "citations": 0,
        "rank": 1
      }
    ]
  }
}
```

**Implementation Location:**
- File: `src/contexts/ProfileContext.tsx`
- Function: `generateQuestionsAndCompetitors()`
- Line: ~95

---

## 4. AEO Analysis Engine

### Run AEO Analysis
**Endpoint:** `POST /profiles/{profileId}/analyze`

**Request Body:**
```json
{
  "questions": [...],
  "competitors": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profileId": "prof_abc123",
    "analysisResult": {
      "overallScore": 76,
      "mentions": 245,
      "seoHealth": 88,
      "citations": 89,
      "brokenLinks": 4,
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
          "llm": "ChatGPT",
          "score": 82,
          "mentions": 245,
          "citations": 89,
          "topSources": [
            {
              "url": "techcrunch.com",
              "weight": 9.2,
              "mentions": 34
            }
          ],
          "categoryPerformance": [
            {
              "category": "Product Recommendation",
              "score": 88
            }
          ]
        }
      ]
    }
  }
}
```

**Implementation Location:**
- File: `src/contexts/ProfileContext.tsx`
- Function: `runAnalysis()`
- Line: ~145

**Processing Time:** 30-60 seconds
**Status Updates:** Use WebSocket or polling for real-time status

---

## 5. Content Optimization

### Get Optimization Recommendations
**Endpoint:** `POST /optimize/content`

**Request Body:**
```json
{
  "profileId": "prof_abc123",
  "productName": "Smart Speaker Pro",
  "currentScore": 76
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Based on analysis, we've identified key opportunities...",
    "projectedScore": 83,
    "recommendations": [
      {
        "priority": "CRITICAL",
        "title": "Add Technical Specifications",
        "description": "Include detailed specs...",
        "category": "technical",
        "difficulty": "Easy",
        "impact": "High",
        "improvement": "+8% visibility",
        "actionItems": [
          "Add product dimensions",
          "Include compatibility list"
        ]
      }
    ]
  }
}
```

**Implementation Location:**
- File: `src/components/ActionPanel.tsx`
- Function: `handleOptimize()`
- Line: ~73

---

## 6. SEO Health Check

### Run SEO Health Check
**Endpoint:** `POST /seo/health-check`

**Request Body:**
```json
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
        "issues": ["Some pages lack content depth"]
      },
      "brokenLinks": {
        "score": 60,
        "status": "warning",
        "count": 4,
        "links": ["page1", "page2"]
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

**Implementation Location:**
- File: `src/components/ActionPanel.tsx`
- Function: `handleHealthCheck()`
- Line: ~35

---

## 7. LLM Insights

### Get LLM-Specific Insights
**Endpoint:** `GET /profiles/{profileId}/llm-insights/{llmName}`

**Parameters:**
- `llmName`: chatgpt | claude | gemini | perplexity

**Response:**
```json
{
  "success": true,
  "data": {
    "llm": "ChatGPT",
    "score": 82,
    "mentions": 245,
    "citations": 89,
    "topSources": [...],
    "categoryPerformance": [...],
    "strengths": [...],
    "improvements": [...]
  }
}
```

**Implementation Location:**
- File: `src/pages/ProfileAnalysis.tsx`
- Modal: LLM Details Analytics Modal
- Line: ~957

---

## 8. Reports

### Generate PDF Report
**Endpoint:** `POST /reports/generate`

**Request Body:**
```json
{
  "profileId": "prof_abc123",
  "format": "pdf",
  "sections": ["overview", "llm-performance", "competitors", "recommendations"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportUrl": "https://cdn.aeo-intelligence.com/reports/report_xyz.pdf",
    "expiresAt": "2025-01-16T10:30:00Z"
  }
}
```

**Implementation Location:**
- File: `src/components/ActionPanel.tsx`
- Function: `handleGenerateReport()`
- Line: ~50

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid website URL format",
    "details": {
      "field": "websiteUrl",
      "reason": "Must be a valid URL"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Invalid or missing API key
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error
- `TIMEOUT` - Request timeout

---

## Rate Limits

| Endpoint | Rate Limit | Burst |
|----------|-----------|--------|
| Product Generation | 10/hour | 2 |
| Question Generation | 5/hour | 1 |
| Analysis Engine | 3/hour | 1 |
| Content Optimization | 20/hour | 5 |
| SEO Health Check | 10/hour | 3 |
| Reports | 20/hour | 5 |

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://api.aeo-intelligence.com/v1
VITE_API_KEY=your_api_key_here

# Optional: WebSocket for real-time updates
VITE_WS_URL=wss://ws.aeo-intelligence.com

# Feature Flags
VITE_ENABLE_REAL_TIME_UPDATES=true
VITE_ENABLE_EXPORT=true
```

---

## Implementation Checklist

### Phase 1: Core Functionality
- [ ] Profile Management (Create, Read, Update, Delete)
- [ ] Product Generation from Website
- [ ] Question & Competitor Generation
- [ ] AEO Analysis Engine

### Phase 2: Advanced Features
- [ ] Content Optimization Recommendations
- [ ] SEO Health Check
- [ ] LLM-Specific Insights
- [ ] Report Generation

### Phase 3: Real-time & Polish
- [ ] WebSocket for real-time analysis updates
- [ ] Export functionality (PDF, CSV)
- [ ] Notification system integration
- [ ] Analytics tracking

---

## Testing

### API Testing Tools
- **Postman Collection**: Import `postman_collection.json`
- **Swagger UI**: `https://api.aeo-intelligence.com/docs`
- **Test API Key**: Contact support for sandbox access

### Mock vs Production
The app currently uses mock data. To switch to production:

1. Set environment variables
2. Replace mock functions with API calls
3. Test each endpoint individually
4. Implement error handling
5. Add loading states
6. Test rate limits

---

## Support

For API access, documentation, or issues:
- Email: api@aeo-intelligence.com
- Docs: https://docs.aeo-intelligence.com
- Status: https://status.aeo-intelligence.com

---

## Change Log

### v1.0 (Current)
- Initial API specification
- All core endpoints defined
- Mock data structure documented

