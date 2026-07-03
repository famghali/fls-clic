"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const COLORS = { ink: "#1B2A4A", paper: "#F6F2E9", amber: "#C9932E", line: "#D9CFB8", rust: "#B4552F" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7, border: `1.5px solid ${COLORS.line}`, fontSize: 14 };

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("apprenant");
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role, class_code: role === "apprenant" && classCode ? classCode.toUpperCase() : null } },
    });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Si la confirmation par courriel est activée dans Supabase, il n'y a pas encore de session ici.
    if (data.user && !data.session) {
      setNeedsConfirm(true);
      setLoading(false);
      // Le profil sera créé après confirmation, à la première connexion (voir dashboard).
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      role,
      class_code: role === "apprenant" && classCode ? classCode.toUpperCase() : null,
    });
    setLoading(false);
    if (profileError) {
      setError("Compte créé mais erreur lors de l'enregistrement du profil : " + profileError.message);
      return;
    }
    router.push("/dashboard");
  };

  if (needsConfirm) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", padding: 28, borderRadius: 12, maxWidth: 380, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
          <h2 style={{ color: COLORS.ink }}>Vérifiez vos courriels</h2>
          <p style={{ fontSize: 14, color: "#555", marginTop: 10 }}>
            Un lien de confirmation a été envoyé à <strong>{email}</strong>. Cliquez dessus, puis revenez vous connecter.
          </p>
          <a href="/login" style={{ display: "inline-block", marginTop: 16, color: COLORS.ink, fontWeight: 600 }}>Aller à la connexion</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 28, borderRadius: 12, width: 380, border: `1px solid ${COLORS.line}` }}>
        <h1 style={{ fontSize: 22, marginBottom: 4, color: COLORS.ink }}>Créer un compte</h1>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Le Carnet de route linguistique</p>

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nom complet</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} required value={name} onChange={(e) => setName(e.target.value)} />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Courriel</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Mot de passe (min. 6 caractères)</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Rôle</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["apprenant", "enseignant"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 7, cursor: "pointer",
                border: `1.5px solid ${role === r ? COLORS.ink : COLORS.line}`,
                background: role === r ? COLORS.ink : "#fff",
                color: role === r ? "#fff" : COLORS.ink, fontWeight: 600, fontSize: 13, textTransform: "capitalize",
              }}
            >
              {r === "apprenant" ? "Apprenant·e" : "Enseignant·e"}
            </button>
          ))}
        </div>

        {role === "apprenant" && (
          <>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Code de classe (optionnel)</label>
            <input style={{ ...inputStyle, marginBottom: 14 }} value={classCode} onChange={(e) => setClassCode(e.target.value)} />
          </>
        )}

        {error && <p style={{ color: COLORS.rust, fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px 0", background: COLORS.ink, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Création…" : "Créer mon compte"}
        </button>

        <p style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
          Déjà un compte ? <a href="/login" style={{ color: COLORS.ink, fontWeight: 600 }}>Se connecter</a>
        </p>
      </form>
    </div>
  );
}
