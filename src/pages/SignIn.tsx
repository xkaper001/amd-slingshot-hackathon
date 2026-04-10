import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import "./SignIn.css";

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      // Auth listener in App.tsx handles routing after sign-in
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code !== "auth/popup-closed-by-user"
      ) {
        setError("Sign-in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="signin-root">
      {/* Animated organic background */}
      <div className="signin-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grain" />
      </div>

      {/* Floating botanical accents */}
      <div className="leaf leaf-1" aria-hidden="true">
        <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M40 115 C10 90 0 60 5 30 C10 5 30 0 40 0 C50 0 70 5 75 30 C80 60 70 90 40 115Z"
            fill="currentColor"
            opacity="0.35"
          />
          <line x1="40" y1="5" x2="40" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="40" y1="30" x2="15" y2="50" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
          <line x1="40" y1="50" x2="65" y2="65" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
          <line x1="40" y1="65" x2="18" y2="80" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </div>
      <div className="leaf leaf-2" aria-hidden="true">
        <svg viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 88 C8 68 0 45 4 22 C8 4 22 0 30 0 C38 0 52 4 56 22 C60 45 52 68 30 88Z"
            fill="currentColor"
            opacity="0.25"
          />
        </svg>
      </div>
      <div className="leaf leaf-3" aria-hidden="true">
        <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5 30 C5 30 20 5 50 5 C80 5 98 20 98 30 C98 40 80 55 50 55 C20 55 5 30 5 30Z"
            fill="currentColor"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Card */}
      <main className="signin-card" role="main">
        {/* Logo mark */}
        <div className="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <path
              d="M24 42 C14 35 8 27 9 18 C10 10 16 7 24 7 C32 7 38 10 39 18 C40 27 34 35 24 42Z"
              fill="currentColor"
              opacity="0.9"
            />
            <line x1="24" y1="9" x2="24" y2="40" stroke="white" strokeWidth="1.2" opacity="0.6" />
            <line x1="24" y1="20" x2="14" y2="28" stroke="white" strokeWidth="1" opacity="0.5" />
            <line x1="24" y1="28" x2="34" y2="34" stroke="white" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        {/* App name */}
        <h1 className="signin-title">
          Nourish<span className="title-accent">AI</span>
        </h1>

        {/* Tagline */}
        <p className="signin-tagline">Eat smarter, one craving at a time.</p>

        {/* Divider */}
        <div className="signin-divider" aria-hidden="true">
          <span />
          <span className="divider-dot" />
          <span />
        </div>

        {/* Google Sign-In button */}
        <button
          id="google-signin-btn"
          className={`signin-btn ${loading ? "signin-btn--loading" : ""}`}
          onClick={handleGoogleSignIn}
          disabled={loading}
          aria-label="Continue with Google"
        >
          {loading ? (
            <span className="btn-spinner" aria-hidden="true" />
          ) : (
            <GoogleLogo />
          )}
          <span>{loading ? "Signing in…" : "Continue with Google"}</span>
        </button>

        {/* Error message */}
        {error && (
          <p className="signin-error" role="alert">
            {error}
          </p>
        )}

        {/* Footer note */}
        <p className="signin-footer">
          By continuing, you agree to our{" "}
          <a href="#" className="signin-link">
            Terms
          </a>{" "}
          &amp;{" "}
          <a href="#" className="signin-link">
            Privacy Policy
          </a>
          .
        </p>
      </main>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg
      className="google-logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
