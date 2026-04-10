import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import SignIn from "./pages/SignIn";
import Preferences from "./pages/Preferences";
import Home from "./pages/Home";

// ─── Dev bypass ───────────────────────────────────────────
// Set to true to skip auth and go straight to /app for testing.
// Flip back to false before committing / deploying.
const DEV_BYPASS_AUTH = true;
// ─────────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!DEV_BYPASS_AUTH);

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      navigate("/app");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setLoading(true);
      if (!user) {
        navigate("/");
        setLoading(false);
      } else {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            navigate("/app");
          } else {
            navigate("/preferences");
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          navigate("/preferences");
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/app" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
