"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const COLORS = { ink: "#1B2A4A", paper: "#F6F2E9", amber: "#C9932E", line: "#D9CFB8", rust: "#B4552F" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7, border: `1.5px solid ${COLORS.line}`, fontSize: 14 };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setReady(!!session));
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", padding: 28, borderRadius: 12, width: 360, border: `1px solid ${COLORS.line}` }}>
        <h1 style={{ fontSize: 22, marginBottom: 4, color: COLORS.ink }}>Nouveau mot de passe</h1>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Le Carnet de route linguistique FLS/CLIC</p>

        {!ready && !success && (
          <p style={{ fontSize: 13, color: COLORS.rust }}>
            Ce lien de réinitialisation est invalide ou a expiré. Retournez à la page de connexion et refaites une demande.
          </p>
        )}

        {ready && !success && (
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nouveau mot de passe (min. 6 caractères)</label>
            <input style={{ ...inputStyle, marginBottom: 14 }} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Confirmer le mot de passe</label>
            <input style={{ ...inputStyle, marginBottom: 14 }} type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            {error && <p style={{ color: COLORS.rust, fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px 0", background: COLORS.ink, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
            </button>
          </form>
        )}

        {success && (
          <div>
            <p style={{ fontSize: 13, color: "#2f6b3e", marginBottom: 14 }}>Mot de passe mis à jour avec succès.</p>
            <button onClick={() => router.push("/login")} style={{ width: "100%", padding: "10px 0", background: COLORS.ink, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
              Aller à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
