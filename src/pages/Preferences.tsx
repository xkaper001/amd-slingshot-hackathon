import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Preferences.css";

/* ─── Constants ──────────────────────────────────────────── */
const DIET_OPTIONS = [
  { value: "vegetarian", label: "🌿 Vegetarian" },
  { value: "vegan", label: "🥦 Vegan" },
  { value: "non-vegetarian", label: "🍗 Non-Vegetarian" },
] as const;

type DietType = (typeof DIET_OPTIONS)[number]["value"];

const ALLERGY_OPTIONS = [
  { value: "gluten", label: "Gluten", emoji: "🌾" },
  { value: "dairy", label: "Dairy", emoji: "🥛" },
  { value: "nuts", label: "Nuts", emoji: "🥜" },
  { value: "shellfish", label: "Shellfish", emoji: "🦐" },
  { value: "soy", label: "Soy", emoji: "🫘" },
  { value: "eggs", label: "Eggs", emoji: "🥚" },
];

/* ─── Component ──────────────────────────────────────────── */
export default function Preferences() {
  const navigate = useNavigate();
  const [diet, setDiet] = useState<DietType | null>(null);
  const [allergies, setAllergies] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Toggle an allergy chip */
  const toggleAllergy = (value: string) => {
    setAllergies((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  /* Save to Firestore */
  const handleSave = async () => {
    if (!diet) {
      setError("Please select a diet type to continue.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("Session expired. Please sign in again.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await setDoc(doc(db, "users", user.uid), {
        dietType: diet,
        allergies: Array.from(allergies),
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      navigate("/app");
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Failed to save preferences. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="pref-root">
      {/* Ambient background */}
      <div className="pref-bg">
        <div className="pref-blob pref-blob-1" />
        <div className="pref-blob pref-blob-2" />
      </div>

      <main className="pref-card" role="main">
        {/* Header */}
        <header className="pref-header">
          <div className="pref-step-badge">Step 1 of 1</div>
          <h1 className="pref-title">Your preferences</h1>
          <p className="pref-subtitle">
            Help NourishAI personalise every recommendation to suit you.
          </p>
        </header>

        {/* ── Diet type ── */}
        <section className="pref-section" aria-labelledby="diet-label">
          <h2 className="pref-section-title" id="diet-label">
            Diet type
          </h2>
          <div className="pref-pills" role="group" aria-labelledby="diet-label">
            {DIET_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                id={`diet-${value}`}
                className={`pref-pill${diet === value ? " pref-pill--active" : ""}`}
                onClick={() => setDiet(value)}
                aria-pressed={diet === value}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="pref-rule" aria-hidden="true" />

        {/* ── Allergies ── */}
        <section className="pref-section" aria-labelledby="allergy-label">
          <h2 className="pref-section-title" id="allergy-label">
            Allergies &amp; intolerances
            <span className="pref-optional">optional</span>
          </h2>
          <p className="pref-section-hint">Select all that apply.</p>
          <div
            className="pref-allergy-grid"
            role="group"
            aria-labelledby="allergy-label"
          >
            {ALLERGY_OPTIONS.map(({ value, label, emoji }) => {
              const selected = allergies.has(value);
              return (
                <button
                  key={value}
                  id={`allergy-${value}`}
                  className={`pref-allergy-chip${selected ? " pref-allergy-chip--active" : ""}`}
                  onClick={() => toggleAllergy(value)}
                  aria-pressed={selected}
                  type="button"
                >
                  <span className="chip-emoji" aria-hidden="true">
                    {emoji}
                  </span>
                  <span className="chip-label">{label}</span>
                  {selected && (
                    <span className="chip-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="pref-error" role="alert">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          id="save-continue-btn"
          className={`pref-cta${saving ? " pref-cta--loading" : ""}`}
          onClick={handleSave}
          disabled={saving}
          type="button"
          aria-label="Save preferences and continue"
        >
          {saving ? (
            <>
              <span className="pref-spinner" aria-hidden="true" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <span>Save &amp; Continue</span>
              <span className="cta-arrow" aria-hidden="true">→</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
}
