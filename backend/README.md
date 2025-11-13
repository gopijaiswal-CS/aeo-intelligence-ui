# AEO Intelligence Backend API

Backend API for the AEO Intelligence Platform - Answer Engine Optimization analysis and monitoring.

## Features

- ✅ Profile Management (CRUD operations)
- ✅ **Multi-LLM Support** - OpenAI (Default) & Google Gemini
- ✅ Product Generation from Website URL using AI
- ✅ Questions & Competitors Generation using AI
- ✅ AEO Analysis Engine with LLM testing
- ✅ Content Optimization Recommendations
- ✅ SEO Health Check
- ✅ MongoDB integration
- ✅ RESTful API design
- ✅ Error handling and validation
- ✅ Dynamic LLM provider switching

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **AI/LLM**: OpenAI (Default), Google Gemini AI
- **Web Scraping**: Axios + Cheerio

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- OpenAI API Key (Recommended - Default)
- Gemini API Key (Optional - Alternative)

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aeo-intelligence

# AI Model API Keys
OPENAI_API_KEY=your_openai_api_key_here       # Primary (Default)
GEMINI_API_KEY=your_gemini_api_key_here       # Alternative (Optional)

CORS_ORIGIN=http://localhost:5173
DEFAULT_AI_PROVIDER=openai                     # openai or gemini
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### Profile Management

#### Create Profile
```
POST /api/v1/profiles
Content-Type: application/json

{
  "websiteUrl": "https://example.com",
  "productName": "Product Name",
  "category": "Category",
  "region": "us"
}
```

#### Get All Profiles
```
GET /api/v1/profiles
```

#### Get Profile by ID
```
GET /api/v1/profiles/:id
```

#### Update Profile
```
PUT /api/v1/profiles/:id
Content-Type: application/json

{
  "status": "completed",
  "questions": [...],
  "competitors": [...]
}
```

#### Delete Profile
```
DELETE /api/v1/profiles/:id
```

#### Generate Questions and Competitors
```
POST /api/v1/profiles/:id/generate
```

#### Run AEO Analysis
```
POST /api/v1/profiles/:id/analyze
```

### Product Generation

#### Generate Products from URL
```
POST /api/v1/products/generate
Content-Type: application/json

{
  "websiteUrl": "https://example.com"
}
```

### Content Optimization

#### Get Optimization Recommendations
```
POST /api/v1/optimize/content
Content-Type: application/json

{
  "profileId": "profile_id_here"
}
```

### SEO Health Check

#### Run SEO Health Check
```
POST /api/v1/seo/health-check
Content-Type: application/json

{
  "websiteUrl": "https://example.com"
}
```

### LLM Management

#### Get Available LLM Providers
```
GET /api/v1/llm/providers
```

#### Get Models for Specific Provider
```
GET /api/v1/llm/providers/:provider/models
```

#### Test LLM Connection
```
POST /api/v1/llm/test
Content-Type: application/json

{
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

#### Get Current LLM Configuration
```
GET /api/v1/llm/config
```

## API Response Format

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
    "message": "Error message",
    "details": {}
  }
}
```

## Error Codes

- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `INVALID_URL` - Invalid URL format
- `GENERATION_ERROR` - Error generating data
- `ANALYSIS_ERROR` - Error running analysis
- `SERVER_ERROR` - Internal server error

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   ├── gemini.js    # Gemini AI setup (Legacy)
│   │   └── llm.js       # Unified LLM config (OpenAI + Gemini)
│   ├── controllers/     # Request handlers
│   │   ├── profileController.js
│   │   ├── productController.js
│   │   ├── optimizationController.js
│   │   ├── seoController.js
│   │   └── llmController.js
│   ├── models/          # Database models
│   │   └── Profile.js
│   ├── routes/          # API routes
│   │   ├── index.js
│   │   ├── profileRoutes.js
│   │   ├── productRoutes.js
│   │   ├── optimizationRoutes.js
│   │   ├── seoRoutes.js
│   │   └── llmRoutes.js
│   ├── services/        # Business logic
│   │   ├── geminiService.js
│   │   └── analysisService.js
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   └── server.js        # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/aeo-intelligence |
| `OPENAI_API_KEY` | OpenAI API key (Primary) | - |
| `GEMINI_API_KEY` | Google Gemini API key (Optional) | - |
| `DEFAULT_AI_PROVIDER` | Default AI provider | openai |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## MongoDB Setup

### Local MongoDB:
```bash
# Install MongoDB
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify MongoDB is running
mongosh
```

### MongoDB Atlas (Cloud):
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## AI Provider Setup

### OpenAI (Default & Recommended)

1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env` file as `OPENAI_API_KEY`

**Supported Models:**
- `gpt-4o` - Most capable GPT-4 model
- `gpt-4o-mini` - Fast and efficient (Default)
- `gpt-4-turbo` - Previous generation GPT-4
- `gpt-3.5-turbo` - Faster, cost-effective

### Google Gemini (Alternative)

1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `.env` file as `GEMINI_API_KEY`

**Supported Models:**
- `gemini-2.5-flash` - Latest Gemini model
- `gemini-2.0-flash` - Fast generation (Default for Gemini)
- `gemini-pro` - Balanced performance

### Switching Between Providers

The system uses OpenAI by default. To switch:

1. **Via Environment Variable**: Set `DEFAULT_AI_PROVIDER=gemini` in `.env`
2. **Via API**: Use the LLM management endpoints to test and switch providers
3. **Programmatically**: Pass provider option in service calls

```javascript
// Example: Using a specific provider
await generateContent(prompt, {
  provider: 'gemini',  // or 'openai'
  model: 'gemini-pro',
  temperature: 0.7
});
```

## Development

### Adding New Endpoints:

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Register route in `src/routes/index.js`

### Adding New Services:

1. Create service file in `src/services/`
2. Export functions
3. Import in controllers

## Testing

Test endpoints using cURL, Postman, or Thunder Client:

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Create profile
curl -X POST http://localhost:3000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl":"https://example.com","productName":"Test","category":"Tech","region":"us"}'
```

## Troubleshooting

### MongoDB Connection Issues:
- Ensure MongoDB is running: `mongosh`
- Check connection string in `.env`
- Verify network access if using MongoDB Atlas

### AI/LLM API Issues:

**OpenAI:**
- Verify API key is valid at https://platform.openai.com/api-keys
- Check billing and usage limits
- Review error messages in logs
- Ensure you have sufficient credits

**Gemini:**
- Verify API key is valid
- Check API quota/limits
- Review error messages in logs

**Connection Testing:**
```bash
curl -X POST http://localhost:3000/api/v1/llm/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","model":"gpt-4o-mini"}'
```

### CORS Issues:
- Update `CORS_ORIGIN` in `.env`
- Ensure frontend URL matches CORS_ORIGIN

## Performance Optimization

- Indexes are added to frequently queried fields
- Connection pooling for MongoDB
- Request logging for monitoring
- Error handling middleware

## Security Considerations

- Environment variables for sensitive data
- Input validation on all endpoints
- MongoDB injection prevention via Mongoose
- CORS configuration

## License

ISC

## Support

For issues and questions, please contact the development team.

