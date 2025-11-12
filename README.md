# 📊 StackIQ — Competitive Intelligence for AI Visibility  
> Built for the Contentstack Hackathon | Category: **AI Pioneers - Intelligent Experiences**

---

## 🚀 Overview  
**StackIQ** is a competitive intelligence platform that helps companies **stack their insights** and understand how their products rank against competitors in **AI model responses** like ChatGPT, Claude, and Gemini.  
It provides comprehensive competitive analysis, citation source breakdowns, and actionable recommendations to **dominate AI search results** and improve **Answer Engine Optimization (AEO)**.

---

## 🧩 Key Features  

### 🔍 Product & Competitor Analysis  
- Input your **website**, **product**, and **location**.  
- Automatically generate **5 relevant questions** about your product.  
- Optionally add **custom questions** and **competitors**.  

### 🤖 LLM Visibility Engine  
- Simulate multiple LLM responses (mocked for now).  
- Detect how often your brand or competitors appear in answers.  
- Analyze **citation weight**, **ranking position**, and **source credibility**.

### 📊 Interactive Dashboard  
Includes:
- **Donut Chart** → Visibility & appearance ratio.  
- **Comparison Table** → Brand vs Competitors across queries.  
- **Bar/Line Charts** → Keyword ranking, citation trends, and SEO score evolution.

### 🧠 Smart Recommendations  
- SEO & AEO suggestions based on ranking data.  
- Auto-generated **content improvement prompts** using LLM (mocked).  
- Detect and report **broken sitemap links** or missing meta tags.

### 🧰 Built With Productivity & Scale  
- Modular components for easy extension.
- Built to plug into **Contentstack** in future via APIs and SDKs.  
- Mock data layer allows quick demo-ready deployment.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + Shadcn/UI |
| **Charts** | Recharts (Donut, Line, Bar) |
| **State Management** | Zustand or React Context |
| **Mock Backend** | Local JSON data or Mirage.js |
| **Optional LLM Simulation** | OpenAI mock adapter for testing |

---

## ⚙️ Project Flow  

```mermaid
flowchart TD
A[Enter Website URL] --> B[Auto-generate 5 Questions]
B --> C[Select Product & Location]
C --> D[Add Custom Questions/Competitors]
D --> E[Run AEO Engine Simulation]
E --> F[Analyze Rankings & Citations]
F --> G[Display Charts & Tables]
G --> H[Generate SEO/AEO Suggestions]
H --> I[Export Report or Re-run Analysis]
