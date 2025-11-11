# API Testing Examples

## Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### 2. Generate Products from Website
```bash
curl -X POST http://localhost:3000/api/v1/products/generate \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://apple.com"
  }'
```

### 3. Create a New Profile
```bash
curl -X POST http://localhost:3000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://example.com",
    "productName": "Smart Speaker Pro",
    "category": "Smart Home",
    "region": "us"
  }'
```

Save the profile ID from the response for next steps.

### 4. Get All Profiles
```bash
curl http://localhost:3000/api/v1/profiles
```

### 5. Generate Questions and Competitors
Replace `PROFILE_ID` with the actual ID from step 3:
```bash
curl -X POST http://localhost:3000/api/v1/profiles/PROFILE_ID/generate \
  -H "Content-Type: application/json"
```

### 6. Run AEO Analysis
```bash
curl -X POST http://localhost:3000/api/v1/profiles/PROFILE_ID/analyze \
  -H "Content-Type: application/json"
```

### 7. Get Optimization Recommendations
```bash
curl -X POST http://localhost:3000/api/v1/optimize/content \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "PROFILE_ID"
  }'
```

### 8. Run SEO Health Check
```bash
curl -X POST http://localhost:3000/api/v1/seo/health-check \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://example.com"
  }'
```

### 9. Update Profile
```bash
curl -X PUT http://localhost:3000/api/v1/profiles/PROFILE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### 10. Delete Profile
```bash
curl -X DELETE http://localhost:3000/api/v1/profiles/PROFILE_ID
```

## Full Workflow Example

```bash
# Step 1: Generate products from a website
RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/products/generate \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://example.com"}')
echo "Products: $RESPONSE"

# Step 2: Create a profile
PROFILE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://example.com",
    "productName": "Example Product",
    "category": "Technology",
    "region": "us"
  }')
echo "Profile Created: $PROFILE_RESPONSE"

# Extract profile ID (requires jq)
PROFILE_ID=$(echo $PROFILE_RESPONSE | jq -r '.data._id')
echo "Profile ID: $PROFILE_ID"

# Step 3: Generate questions and competitors
curl -s -X POST "http://localhost:3000/api/v1/profiles/$PROFILE_ID/generate" \
  -H "Content-Type: application/json"

# Wait for generation to complete
sleep 5

# Step 4: Run analysis
curl -s -X POST "http://localhost:3000/api/v1/profiles/$PROFILE_ID/analyze" \
  -H "Content-Type: application/json"

# Step 5: Get optimization recommendations
curl -s -X POST http://localhost:3000/api/v1/optimize/content \
  -H "Content-Type: application/json" \
  -d "{\"profileId\": \"$PROFILE_ID\"}"
```

## Using Postman

### Import Collection

Create a new collection in Postman with these requests:

1. **Health Check**
   - Method: GET
   - URL: `http://localhost:3000/api/v1/health`

2. **Generate Products**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/products/generate`
   - Body (JSON):
     ```json
     {
       "websiteUrl": "https://example.com"
     }
     ```

3. **Create Profile**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/profiles`
   - Body (JSON):
     ```json
     {
       "websiteUrl": "https://example.com",
       "productName": "Product Name",
       "category": "Category",
       "region": "us"
     }
     ```

4. **Generate Questions**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/profiles/{{profileId}}/generate`
   - Note: Create a variable `profileId` in Postman

5. **Run Analysis**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/profiles/{{profileId}}/analyze`

## Using JavaScript/Fetch

```javascript
// Create profile
const response = await fetch('http://localhost:3000/api/v1/profiles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    websiteUrl: 'https://example.com',
    productName: 'Product Name',
    category: 'Technology',
    region: 'us'
  })
});

const data = await response.json();
console.log('Profile created:', data);

// Generate questions
const profileId = data.data._id;
await fetch(`http://localhost:3000/api/v1/profiles/${profileId}/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Run analysis
await fetch(`http://localhost:3000/api/v1/profiles/${profileId}/analyze`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
});
```

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Profile Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Product Analysis",
  "websiteUrl": "https://example.com",
  "productName": "Product Name",
  "category": "Technology",
  "region": "us",
  "status": "completed",
  "questions": [...],
  "competitors": [...],
  "analysisResult": {
    "overallScore": 75,
    "mentions": 150,
    "seoHealth": 88,
    "citations": 50,
    "brokenLinks": 2,
    "trend": [65, 68, 70, 72, 74, 75, 76],
    "citationSources": [...],
    "llmPerformance": [...]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Rate Limiting Notes

- Gemini API has rate limits
- Add delays between requests if testing multiple operations
- Monitor API usage in Google Cloud Console

## Debugging Tips

1. **Check Server Logs**: Terminal running `npm run dev`
2. **Verify MongoDB**: Run `mongosh` to check database
3. **Network Tab**: Use browser DevTools to inspect requests
4. **API Response**: Check `success` field in all responses
5. **Status Codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 404: Not Found
   - 500: Server Error

