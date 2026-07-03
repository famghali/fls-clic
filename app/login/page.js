"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const COLORS = { ink: "#1B2A4A", paper: "#F6F2E9", amber: "#C9932E", line: "#D9CFB8", rust: "#B4552F" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7, border: `1.5px solid ${COLORS.line}`, fontSize: 14 };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Courriel ou mot de passe incorrect." : error.message);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 28, borderRadius: 12, width: 360, border: `1px solid ${COLORS.line}` }}>
        <h1 style={{ fontSize: 22, marginBottom: 4, color: COLORS.ink }}>Se connecter</h1>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Le Carnet de route linguistique</p>

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Courriel</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Mot de passe</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p style={{ color: COLORS.rust, fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px 0", background: COLORS.ink, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Connexion…" : "Entrer"}
        </button>

        <p style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
          Pas encore de compte ? <a href="/signup" style={{ color: COLORS.ink, fontWeight: 600 }}>Créer un compte</a>
        </p>
      </form>
    </div>
  );
}
