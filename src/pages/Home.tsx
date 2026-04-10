import { useState, useEffect } from "react";
import "./Home.css";

/* ─── Types ──────────────────────────────────────────────── */
interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  name: string;
  description: string;
  healthScore: number;
  nutrition: Nutrition;
  recipe: string[];
  searchQuery: string;
}

interface HistoryEntry {
  id: string;
  craving: string;
  createdAt: Date;
  suggestions: Meal[];
}

const API_BASE = "";

/* ─── Helpers ────────────────────────────────────────────── */
function healthBadgeClass(score: number) {
  if (score >= 8) return "badge--green";
  if (score >= 5) return "badge--yellow";
  return "badge--red";
}

/* ─── Skeleton card ──────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="meal-card meal-card--skeleton">
      <div className="sk sk--title" />
      <div className="sk sk--badge" />
      <div className="sk sk--chips" />
      <div className="sk sk--line" />
      <div className="sk sk--line sk--short" />
    </div>
  );
}

/* ─── Meal card ──────────────────────────────────────────── */
function MealCard({ meal }: { meal: Meal }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="meal-card">
      {/* Header */}
      <div className="meal-card__header">
        <h3 className="meal-name">{meal.name}</h3>
        <span className={`health-badge ${healthBadgeClass(meal.healthScore)}`}>
          ⚡ {meal.healthScore}/10
        </span>
      </div>

      <p className="meal-desc">{meal.description}</p>

      {/* Nutrition chips */}
      <div className="nutrition-row" aria-label="Nutrition information">
        <span className="nutr-chip nutr-chip--cal">
          🔥 {meal.nutrition.calories} kcal
        </span>
        <span className="nutr-chip nutr-chip--protein">
          💪 {meal.nutrition.protein}g protein
        </span>
        <span className="nutr-chip nutr-chip--carbs">
          🍞 {meal.nutrition.carbs}g carbs
        </span>
        <span className="nutr-chip nutr-chip--fat">
          🫒 {meal.nutrition.fat}g fat
        </span>
      </div>

      {/* Collapsible recipe */}
      <div className="recipe-section">
        <button
          className="recipe-toggle"
          onClick={() => setOpen((p) => !p)}
          aria-expanded={open}
          aria-controls={`recipe-${meal.name}`}
          type="button"
        >
          <span>Recipe steps</span>
          <span className={`recipe-chevron ${open ? "recipe-chevron--open" : ""}`}>›</span>
        </button>
        {open && (
          <ol className="recipe-steps" id={`recipe-${meal.name}`}>
            {meal.recipe.map((step, i) => (
              <li key={i} className="recipe-step">
                <span className="step-num">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Find Near Me */}
      <a
        className="find-near-btn"
        href={`https://www.google.com/maps/search/${encodeURIComponent(meal.searchQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Find ${meal.name} near me on Google Maps`}
      >
        <span>📍</span>
        <span>Find Near Me</span>
      </a>
    </article>
  );
}

/* ─── History tab ────────────────────────────────────────── */
function HistoryTab() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nourishai_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        // localStorage dates parses as strings, map them back to Date objects
        setEntries(parsed.map((e: any) => ({ ...e, createdAt: new Date(e.createdAt) })));
      }
    } catch (e) {
      console.error("Failed to parse history", e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="history-list">
        {[1, 2, 3].map((i) => (
          <div key={i} className="history-entry">
            <div className="history-entry__header history-entry__header--sk">
              <div className="history-entry__meta">
                <div className="hsk hsk--craving" />
                <div className="hsk hsk--date" />
                <div className="hsk hsk--pills" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="history-empty">
        <span className="history-empty__icon">🍽️</span>
        <p className="history-empty__title">No history yet — try your first search!</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {entries.map((entry) => {
        const isOpen = expanded === entry.id;
        return (
          <div key={entry.id} className={`history-entry${isOpen ? " history-entry--open" : ""}`}>
            {/* Compact header — always visible */}
            <button
              className="history-entry__header"
              onClick={() => setExpanded(isOpen ? null : entry.id)}
              type="button"
              aria-expanded={isOpen}
            >
              <div className="history-entry__meta">
                <span className="history-craving">“{entry.craving}”</span>
                <span className="history-date">
                  {entry.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {/* Meal name pills shown only when collapsed */}
                {!isOpen && entry.suggestions.length > 0 && (
                  <div className="history-meal-pills" aria-label="Suggested meals">
                    {entry.suggestions.map((m, i) => (
                      <span key={i} className="history-meal-pill">{m.name}</span>
                    ))}
                  </div>
                )}
              </div>
              <span
                className={`history-chevron${isOpen ? " history-chevron--open" : ""}`}
                aria-hidden="true"
              >›</span>
            </button>

            {/* Full meal cards, inline, when expanded */}
            {isOpen && (
              <div className="history-entry__meals">
                {entry.suggestions.map((meal, i) => (
                  <MealCard key={i} meal={meal} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Home component ────────────────────────────────── */
export default function Home() {
  const [tab, setTab] = useState<"discover" | "history">("discover");
  const [craving, setCraving] = useState("");
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFind = async () => {
    if (!craving.trim()) return;
    setLoading(true);
    setError(null);
    setMeals(null);

    // Hardcoded preferences for now (since auth/preferences screen is skipped)
    const dietType = "";
    const allergies: string[] = [];

    try {
      const res = await fetch(`${API_BASE}/api/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ craving: craving.trim(), dietType, allergies }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }

      const data = await res.json();
      const suggestions: Meal[] = data.suggestions;
      setMeals(suggestions);

      // Save to localStorage history (up to 10 entries)
      try {
        const saved = JSON.parse(localStorage.getItem("nourishai_history") || "[]");
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          craving: craving.trim(),
          createdAt: new Date(),
          suggestions,
        };
        const updated = [newEntry, ...saved].slice(0, 10);
        localStorage.setItem("nourishai_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save history", e);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-root">
      {/* Ambient blobs */}
      <div className="home-bg">
        <div className="home-blob home-blob-1" />
        <div className="home-blob home-blob-2" />
      </div>

      <div className="home-shell">
        {/* Top bar */}
        <header className="home-topbar">
          <div className="home-brand">
            <span className="home-brand__leaf">🌿</span>
            <span className="home-brand__name">NourishAI</span>
          </div>
        </header>

        {/* Tab bar */}
        <nav className="home-tabs" aria-label="App sections">
          <button
            className={`home-tab${tab === "discover" ? " home-tab--active" : ""}`}
            onClick={() => setTab("discover")}
            type="button"
            id="tab-discover"
          >
            ✨ Discover
          </button>
          <button
            className={`home-tab${tab === "history" ? " home-tab--active" : ""}`}
            onClick={() => setTab("history")}
            type="button"
            id="tab-history"
          >
            📋 History
          </button>
        </nav>

        {/* ── Discover tab ── */}
        {tab === "discover" && (
          <div className="discover-pane">
            {/* Craving input */}
            <div className="craving-card">
              <label className="craving-label" htmlFor="craving-input">
                What are you craving right now?
              </label>
              <textarea
                id="craving-input"
                className="craving-textarea"
                placeholder="e.g. something spicy and cheesy… or a light summer salad…"
                value={craving}
                onChange={(e) => setCraving(e.target.value)}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleFind();
                }}
              />
              <button
                id="find-options-btn"
                className={`find-btn${loading ? " find-btn--loading" : ""}`}
                onClick={handleFind}
                disabled={loading || !craving.trim()}
                type="button"
              >
                {loading ? (
                  <>
                    <span className="find-spinner" aria-hidden="true" />
                    <span>Finding options…</span>
                  </>
                ) : (
                  <>
                    <span>Find Healthy Options</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="result-error" role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Skeletons */}
            {loading && (
              <div className="results-grid">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Results */}
            {meals && !loading && (
              <>
                <p className="results-label">
                  Here are 3 healthy options for <em>"{craving}"</em>
                </p>
                <div className="results-grid">
                  {meals.map((meal, i) => (
                    <MealCard key={i} meal={meal} />
                  ))}
                </div>
              </>
            )}

            {/* Empty state */}
            {!meals && !loading && !error && (
              <div className="discover-empty">
                <div className="discover-empty__art">🥗</div>
                <p>Type a craving above and let NourishAI do the rest.</p>
              </div>
            )}
          </div>
        )}

        {/* ── History tab ── */}
        {tab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}
