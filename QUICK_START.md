# 🚀 Quick Start Guide - AEO Intelligence Platform

## Prerequisites Check

- ✅ Node.js installed
- ✅ MongoDB installed (or MongoDB Atlas account)
- ✅ Backend folder created
- ✅ Gemini API key configured

## 1. Start MongoDB (if using local)

### macOS:
```bash
brew services start mongodb-community
```

### Ubuntu/Linux:
```bash
sudo systemctl start mongodb
```

### Verify MongoDB:
```bash
mongosh
# Should connect successfully
```

## 2. Start the Backend

### Option A: Quick Start Script
```bash
cd backend
./start-backend.sh
```

### Option B: Manual Start
```bash
cd backend
npm install  # First time only
npm run dev
```

### Expected Output:
```
✅ MongoDB Connected: localhost
╔════════════════════════════════════════╗
║   AEO Intelligence API Server          ║
║   Environment: development             ║
║   Port: 3000                           ║
║   API Base: http://localhost:3000/api/v1 ║
╚════════════════════════════════════════╝
```

## 3. Test the Backend

Open a new terminal and run:

```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "AEO Intelligence API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 4. Start the Frontend

In a new terminal:

```bash
# From the project root
npm run dev
```

Frontend will open at: `http://localhost:5173`

## 5. Test the Full Workflow

### In the Frontend UI:

1. **Create Profile**
   - Click "Create New Profile"
   - Enter a website URL (e.g., `https://example.com`)
   - Click "Generate Products"

2. **Select Product & Region**
   - Choose a product from the generated list
   - Select target region
   - Click "Continue"

3. **Generate Questions**
   - System automatically generates 20 questions
   - System identifies competitors
   - Review and add manual questions if needed
   - Click "Continue to Analysis"

4. **Run Analysis**
   - Click "Run AEO Engine"
   - Wait for analysis to complete (may take 1-2 minutes)
   - View results dashboard

5. **Explore Results**
   - Overall visibility score
   - LLM performance breakdown
   - Citation sources
   - Competitor rankings
   - Optimization recommendations

## 6. API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/products/generate` | POST | Generate products from URL |
| `/api/v1/profiles` | POST | Create profile |
| `/api/v1/profiles` | GET | Get all profiles |
| `/api/v1/profiles/:id` | GET | Get profile by ID |
| `/api/v1/profiles/:id/generate` | POST | Generate questions & competitors |
| `/api/v1/profiles/:id/analyze` | POST | Run AEO analysis |
| `/api/v1/optimize/content` | POST | Get optimization recommendations |
| `/api/v1/seo/health-check` | POST | Run SEO health check |

## 7. Troubleshooting

### Backend won't start:

**MongoDB not running:**
```bash
# Check MongoDB status
mongosh

# If not running, start it:
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongodb  # Linux
```

**Port 3000 already in use:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found errors:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend not connecting to backend:

**Check CORS settings in backend `.env`:**
```env
CORS_ORIGIN=http://localhost:5173
```

**Verify backend is running:**
```bash
curl http://localhost:3000/api/v1/health
```

### Gemini API errors:

**Check API key in backend `.env`:**
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Verify API quota:**
- Visit https://makersuite.google.com/app/apikey
- Check usage limits

### MongoDB connection errors:

**Local MongoDB:**
```bash
# Verify MongoDB is running
mongosh

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/aeo-intelligence
```

**MongoDB Atlas (Cloud):**
```bash
# Use Atlas connection string in .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aeo-intelligence
```

## 8. Development Tips

### View Backend Logs:
- All requests are logged in the terminal running `npm run dev`
- Check for errors and API call details

### View Database:
```bash
mongosh
use aeo-intelligence
db.profiles.find().pretty()
```

### Test API with cURL:
```bash
# Create a profile
curl -X POST http://localhost:3000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://example.com",
    "productName": "Test Product",
    "category": "Technology",
    "region": "us"
  }'
```

### Reset Database:
```bash
mongosh
use aeo-intelligence
db.profiles.deleteMany({})
```

## 9. Key Features to Test

### ✅ Product Generation
- Enter any website URL
- AI extracts products automatically
- Categorizes products

### ✅ Question Generation
- 20 diverse questions per profile
- 8 different categories
- Region-specific

### ✅ Competitor Analysis
- Automatic competitor identification
- Visibility scoring
- Citation tracking

### ✅ AEO Analysis
- Multi-LLM testing (ChatGPT, Claude, Gemini, Perplexity)
- Visibility metrics
- Performance breakdown
- Citation sources

### ✅ Content Optimization
- AI-powered recommendations
- Priority scoring
- Action items

### ✅ SEO Health Check
- Technical SEO analysis
- Content quality evaluation
- Broken link detection

## 10. Next Steps

1. ✅ **Explore the Dashboard**
   - Create multiple profiles
   - Compare results
   - Download reports

2. ✅ **Customize Prompts**
   - Edit Gemini prompts in `backend/src/services/geminiService.js`
   - Improve question generation
   - Refine analysis logic

3. ✅ **Add Features**
   - Implement report scheduling
   - Add email notifications
   - Create custom dashboards

4. ✅ **Deploy**
   - Use MongoDB Atlas for database
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Vercel/Netlify

## 🎉 Success!

You now have a fully functional AEO Intelligence platform with:
- ✅ Node.js/Express backend
- ✅ MongoDB database
- ✅ Gemini AI integration
- ✅ Complete API suite
- ✅ React frontend
- ✅ Real-time analysis

## 📚 Documentation

- `backend/README.md` - Detailed backend documentation
- `backend/API_EXAMPLES.md` - API testing examples
- `BACKEND_SETUP.md` - Setup guide

## 🆘 Need Help?

1. Check backend logs in terminal
2. Verify MongoDB connection
3. Test API endpoints with cURL
4. Review error messages
5. Check Network tab in browser DevTools

---

**Happy Analyzing! 🚀**

