const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the generative model
const getModel = (modelName = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = { getModel };

