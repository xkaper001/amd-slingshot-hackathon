# NourishAI 🌿

Eat smarter, one craving at a time.

NourishAI is a full-stack web application that uses Google's advanced Gemini AI to generate personalized, healthy meal suggestions based entirely on what you're craving. Rather than fighting your cravings, NourishAI provides nutritious, perfectly portioned alternatives, complete with health scores, macronutrient breakdowns, and easy-to-follow recipe steps.

## Features ✨

- **Smart Cravings Engine:** Powered by Gemini 3 Flash, translating guilty pleasures into healthy, satisfying realities.
- **Nutritional Insights:** Every generated meal includes a 1-10 health score and a detailed macro breakdown (Calories, Protein, Carbs, Fat).
- **Collapsible Recipes:** Instantly see 3–5 actionable steps to make the meal right now.
- **"Find Near Me" Integration:** Don't feel like cooking? One click instantly searches Google Maps for nearby restaurants serving the meal you selected.
- **Local History Tracking:** Your recent searches and favorite suggestions are saved automatically, accessible anytime via the sleek History tab.
- **Premium Organic UI:** Crafted with a calm, glassmorphic aesthetic—features soft animations, pill badges, and a custom beautiful design framework using vanilla CSS.

## Tech Stack 🛠

- **Frontend:** React + Vite, React Router, CSS Variables & Animations
- **Backend:** Node.js, Express
- **AI Integration:** `@google/generative-ai` (Gemini API)
- **Deployment & Infra:** Docker, Google Cloud Run

## Getting Started (Local Development) 🚀

### 1. Backend Setup

From the root project directory, go into the `server` folder:
```bash
cd server
npm install
```

Start the backend:
```bash
# Provide your Gemini API Key to use the live model
GEMINI_API_KEY="your_api_key_here" npm start

# Or start it in mock-mode to bypass the API (great for UI testing)
MOCK_MODE="true" npm start
```

### 2. Frontend Setup

Open a new terminal window in the root project directory:
```bash
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`. 
*(Note: A local Vite proxy routes all `/api` calls safely to the backend on port 3001, avoiding CORS issues entirely).*

## Deployment 🌐

The app is containerized using a multi-stage `Dockerfile` which builds the frontend, grabs the backend dependencies, and bundles them into a single image to be served flawlessly via Cloud Run.

To deploy via Google Cloud Build:
```bash
gcloud builds submit --config cloudbuild.yaml .
```

*See `DEPLOY.md` for a full, detailed runbook on one-time infrastructure setup and manual deployment options.*
