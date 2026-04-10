import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Set MOCK_MODE=true to bypass Gemini and return fake data (useful when quota is exhausted)
const MOCK_MODE = process.env.MOCK_MODE === "false";

// ─── CORS ──────────────────────────────────────────────────
// Allow requests from the React dev server and production domain
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://localhost:5173",
  process.env.FRONTEND_ORIGIN, // set in production
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

// ─── Serve Frontend ────────────────────────────────────────
// Serve the built React static files from the dist/ folder
app.use(express.static(path.join(__dirname, "dist")));

// ─── Gemini client ─────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// ─── POST /api/suggest ─────────────────────────────────────
app.post("/api/suggest", async (req, res) => {
  const { craving, dietType, allergies = [] } = req.body;

  if (!craving) {
    return res.status(400).json({ error: "craving is required" });
  }

  const allergyNote =
    allergies.length > 0
      ? `The user is allergic to / intolerant of: ${allergies.join(", ")}. Exclude these entirely.`
      : "No known allergies.";

  const dietNote = dietType
    ? `Diet preference: ${dietType}. All suggestions must strictly follow this diet.`
    : "No specific diet restriction.";

  const prompt = `You are a professional nutritionist and chef AI.
The user is craving: "${craving}".
${dietNote}
${allergyNote}

Suggest exactly 3 healthy meal options that satisfy this craving.

Return ONLY a raw JSON array — no markdown, no code fences, no explanation.
The array must contain exactly 3 objects, each with this exact shape:

[
  {
    "name": "Meal name",
    "description": "1-2 sentence appetising description",
    "healthScore": 8,
    "nutrition": {
      "calories": 420,
      "protein": 32,
      "carbs": 45,
      "fat": 12
    },
    "recipe": [
      "Step 1 instruction",
      "Step 2 instruction",
      "Step 3 instruction"
    ],
    "searchQuery": "healthy grilled salmon bowl near me"
  }
]

Rules:
- healthScore is an integer from 1 (least healthy) to 10 (most healthy).
- nutrition values are numbers (no units, just the number).
- recipe must have between 3 and 5 steps. Each step is a concise string.
- searchQuery must be a Google Maps–style search string like "vegan buddha bowl near me".
- Do NOT wrap the output in markdown or any other text. Return ONLY the JSON array.`;

  // ── Mock mode (bypasses Gemini) ────────────────────────
  if (MOCK_MODE) {
    const mock = [
      {
        name: "Spiced Lentil & Spinach Bowl",
        description: "A warming, protein-packed bowl with red lentils, wilted spinach, and a cumin-turmeric drizzle.",
        healthScore: 9,
        nutrition: { calories: 380, protein: 22, carbs: 48, fat: 8 },
        recipe: ["Rinse 1 cup red lentils.", "Simmer with turmeric & vegetable stock 20 min.", "Wilt baby spinach into the pot.", "Season with cumin, lemon juice, salt.", "Serve over brown rice."],
        searchQuery: `healthy lentil bowl near me`,
      },
      {
        name: "Grilled Chicken Quinoa Salad",
        description: "Tender grilled chicken over fluffy quinoa with cherry tomatoes, cucumber, and a light tahini dressing.",
        healthScore: 8,
        nutrition: { calories: 460, protein: 38, carbs: 36, fat: 14 },
        recipe: ["Marinate chicken in lemon, garlic, olive oil 30 min.", "Grill 6 min per side.", "Cook quinoa per package directions.", "Toss with veggies and tahini dressing.", "Slice chicken on top."],
        searchQuery: `grilled chicken quinoa salad restaurant near me`,
      },
      {
        name: "Avocado & Black Bean Wrap",
        description: "A vibrant, filling wrap with smoky black beans, creamy avocado, and a fresh pico de gallo.",
        healthScore: 7,
        nutrition: { calories: 420, protein: 15, carbs: 52, fat: 18 },
        recipe: ["Warm a whole-wheat tortilla.", "Spread mashed avocado on tortilla.", "Layer black beans & pico de gallo.", "Add shredded lettuce and a squeeze of lime.", "Roll tightly and slice."],
        searchQuery: `avocado black bean wrap near me`,
      },
    ];
    return res.json({ suggestions: mock, mock: true });
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip any accidental markdown fences Gemini might still add
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const suggestions = JSON.parse(cleaned);

    if (!Array.isArray(suggestions) || suggestions.length !== 3) {
      throw new Error("Gemini did not return an array of 3 suggestions");
    }

    return res.json({ suggestions });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      error: "Failed to generate suggestions. Please try again.",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

// ─── Health check ──────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ─── React Router Fallback ────────────────────────────────
// Any request that doesn't match an API route falls back to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`NourishAI API server running on http://localhost:${PORT}`);
});
