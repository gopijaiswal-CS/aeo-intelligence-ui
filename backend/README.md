# AEO Intelligence Backend API

Backend API for the AEO Intelligence Platform - Answer Engine Optimization analysis and monitoring.

## Features

- ✅ Profile Management (CRUD operations)
- ✅ Product Generation from Website URL using Gemini AI
- ✅ Questions & Competitors Generation using Gemini AI
- ✅ AEO Analysis Engine with LLM testing
- ✅ Content Optimization Recommendations
- ✅ SEO Health Check
- ✅ MongoDB integration
- ✅ RESTful API design
- ✅ Error handling and validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **AI/LLM**: Google Gemini AI
- **Web Scraping**: Axios + Cheerio

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Gemini API Key

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
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
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
│   │   └── gemini.js    # Gemini AI setup
│   ├── controllers/     # Request handlers
│   │   ├── profileController.js
│   │   ├── productController.js
│   │   ├── optimizationController.js
│   │   └── seoController.js
│   ├── models/          # Database models
│   │   └── Profile.js
│   ├── routes/          # API routes
│   │   ├── index.js
│   │   ├── profileRoutes.js
│   │   ├── productRoutes.js
│   │   ├── optimizationRoutes.js
│   │   └── seoRoutes.js
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
| `GEMINI_API_KEY` | Google Gemini API key | - |
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

## Gemini API Setup

1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `.env` file as `GEMINI_API_KEY`

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

### Gemini API Issues:
- Verify API key is valid
- Check API quota/limits
- Review error messages in logs

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

