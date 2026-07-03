"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const COLORS = { ink: "#1B2A4A", inkSoft: "#3A4A6B", paper: "#F6F2E9", paperDim: "#EDE6D6", amber: "#C9932E", rust: "#B4552F", green: "#3E6B4F", line: "#D9CFB8" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7, border: `1.5px solid ${COLORS.line}`, fontSize: 14 };
const cardStyle = { background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 20 };

const TABS = [
  { id: "documents", label: "Documents" },
  { id: "activites", label: "Activités interactives" },
  { id: "grilles", label: "Grilles d'évaluation" },
  { id: "devoirs", label: "Devoirs & correction IA" },
];

export default function Dashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("documents");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setSession(session);
      let { data: p } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (!p) {
        const meta = session.user.user_metadata || {};
        const { data: created } = await supabase.from("profiles").insert({
          id: session.user.id,
          name: meta.name || session.user.email,
          role: meta.role || "apprenant",
          class_code: meta.class_code || null,
        }).select().single();
        p = created;
      }
      setProfile(p);
      setLoading(false);
    });
  }, [supabase, router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Chargement…</div>;
  if (!profile) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
    Profil introuvable. Si vous venez de confirmer votre courriel, reconnectez-vous. Sinon contactez l'administrateur.
  </div>;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper }}>
      <header style={{ background: COLORS.ink, color: "#fff", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <strong style={{ fontSize: 18 }}>Le Carnet de route linguistique</strong>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right", fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>{profile.name}</div>
            <div style={{ opacity: 0.7, textTransform: "capitalize" }}>{profile.role} {profile.class_code ? `· ${profile.class_code}` : ""}</div>
          </div>
          <button onClick={logout} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>Quitter</button>
        </div>
      </header>

      <nav style={{ display: "flex", gap: 4, padding: "0 28px", background: "#fff", borderBottom: `1px solid ${COLORS.line}`, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13.5,
            color: tab === t.id ? COLORS.ink : COLORS.inkSoft, borderBottom: `3px solid ${tab === t.id ? COLORS.amber : "transparent"}`, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </nav>

      <main style={{ padding: 28, maxWidth: 1080, margin: "0 auto" }}>
        {tab === "documents" && <DocumentsTab supabase={supabase} profile={profile} />}
        {tab === "activites" && <ActivitesTab supabase={supabase} profile={profile} />}
        {tab === "grilles" && <GrillesTab />}
        {tab === "devoirs" && <DevoirsTab supabase={supabase} profile={profile} />}
      </main>
    </div>
  );
}

/* ---------------- DOCUMENTS ---------------- */
function DocumentsTab({ supabase, profile }) {
  const [docs, setDocs] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [classCode, setClassCode] = useState(profile.class_code || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    setDocs(data || []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!title.trim()) return;
    await supabase.from("documents").insert({ owner_id: profile.id, title, content, class_code: classCode || null });
    setTitle(""); setContent(""); setOpen(false);
    load();
  };

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    for (const file of files) {
      const safeName = file.name
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9_.-]/g, "_");
      const path = `${profile.id}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("documents").upload(path, file);
      if (error) { setUploadError(error.message); continue; }
      const { data } = supabase.storage.from("documents").getPublicUrl(path);
      await supabase.from("documents").insert({
        owner_id: profile.id, title: file.name, file_url: data.publicUrl, class_code: classCode || null,
      });
    }
    setUploading(false);
    load();
  };

  const addLink = async () => {
    if (!linkUrl.trim()) return;
    await supabase.from("documents").insert({
      owner_id: profile.id, title: linkTitle.trim() || linkUrl.trim(), file_url: linkUrl.trim(), class_code: classCode || null,
    });
    setLinkTitle(""); setLinkUrl("");
    load();
  };

  const remove = async (id) => { await supabase.from("documents").delete().eq("id", id); load(); };

  return (
    <div>
      <SectionHeader title="Documents" subtitle="Déposez des supports partagés avec votre classe." action={profile.role === "enseignant" && <Btn onClick={() => setOpen(true)}>+ Déposer un document</Btn>} />
      {open && (
        <div style={{ ...cardStyle, background: COLORS.paperDim, marginBottom: 16 }}>
          <F label="Code de classe (optionnel, s'applique à tout ce que vous ajoutez ci-dessous)">
            <input style={inputStyle} value={classCode} onChange={(e) => setClassCode(e.target.value)} />
          </F>

          <F label="Fichiers depuis un disque (local, réseau ou virtuel) — plusieurs à la fois">
            <input type="file" multiple style={inputStyle} onChange={(e) => uploadFiles(e.target.files)} disabled={uploading} />
          </F>
          {uploading && <p style={{ fontSize: 12, color: COLORS.amber }}>Envoi en cours…</p>}
          {uploadError && <p style={{ fontSize: 12, color: COLORS.rust }}>{uploadError}</p>}

          <F label="Ou lien web (Google Drive, OneDrive, Dropbox, site…)">
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Titre (optionnel)" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
              <input style={{ ...inputStyle, flex: 2 }} placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
          </F>
          <Btn ghost onClick={addLink}>+ Ajouter le lien</Btn>

          <hr style={{ border: "none", borderTop: `1px dashed ${COLORS.line}`, margin: "16px 0" }} />

          <F label="Titre"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></F>
          <F label="Contenu"><textarea style={{ ...inputStyle, minHeight: 90 }} value={content} onChange={(e) => setContent(e.target.value)} /></F>
          <Btn onClick={add}>Publier une note texte</Btn> <Btn ghost onClick={() => setOpen(false)}>Fermer</Btn>
        </div>
      )}
      {docs.length === 0 ? <Empty text="Aucun document." /> : docs.map((d) => (
        <div key={d.id} style={{ ...cardStyle, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>{d.file_url ? <a href={d.file_url} target="_blank" rel="noreferrer">{d.title}</a> : d.title}</strong>
            {d.content && <p style={{ fontSize: 13, color: "#666" }}>{d.content}</p>}
          </div>
          {d.owner_id === profile.id && <button onClick={() => remove(d.id)} style={{ color: COLORS.rust, background: "none", border: "none", cursor: "pointer" }}>Supprimer</button>}
        </div>
      ))}
    </div>
  );
}

/* ---------------- ACTIVITÉS ---------------- */
function ActivitesTab({ supabase, profile }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ q: "", options: ["", ""], correct: 0 }]);
  const [playing, setPlaying] = useState(null);
  const [answers, setAnswers] = useState({});

  const load = useCallback(async () => {
    const { data } = await supabase.from("activities").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }, [supabase]);
  useEffect(() => { load(); }, [load]);

  const publish = async () => {
    if (!title.trim()) return;
    await supabase.from("activities").insert({ owner_id: profile.id, title, questions });
    setTitle(""); setQuestions([{ q: "", options: ["", ""], correct: 0 }]); setOpen(false);
    load();
  };

  const score = playing ? playing.questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0) : 0;

  return (
    <div>
      <SectionHeader title="Activités interactives" subtitle="Quiz courts pour pratiquer." action={profile.role === "enseignant" && <Btn onClick={() => setOpen(true)}>+ Nouvelle activité</Btn>} />
      {open && (
        <div style={{ ...cardStyle, background: COLORS.paperDim, marginBottom: 16 }}>
          <F label="Titre"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></F>
          {questions.map((q, i) => (
            <div key={i} style={{ ...cardStyle, marginBottom: 10 }}>
              <F label={`Question ${i + 1}`}><input style={inputStyle} value={q.q} onChange={(e) => setQuestions((qs) => qs.map((x, idx) => idx === i ? { ...x, q: e.target.value } : x))} /></F>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input type="radio" checked={q.correct === oi} onChange={() => setQuestions((qs) => qs.map((x, idx) => idx === i ? { ...x, correct: oi } : x))} />
                  <input style={{ ...inputStyle, flex: 1 }} value={opt} onChange={(e) => setQuestions((qs) => qs.map((x, idx) => idx === i ? { ...x, options: x.options.map((o, oidx) => oidx === oi ? e.target.value : o) } : x))} />
                </div>
              ))}
              <button onClick={() => setQuestions((qs) => qs.map((x, idx) => idx === i ? { ...x, options: [...x.options, ""] } : x))} style={{ fontSize: 12, background: "none", border: "none", color: COLORS.ink, cursor: "pointer" }}>+ Ajouter un choix</button>
            </div>
          ))}
          <Btn ghost onClick={() => setQuestions((qs) => [...qs, { q: "", options: ["", ""], correct: 0 }])}>+ Ajouter une question</Btn>{" "}
          <Btn onClick={publish}>Publier</Btn> <Btn ghost onClick={() => setOpen(false)}>Annuler</Btn>
        </div>
      )}

      {playing ? (
        <div style={cardStyle}>
          <h3>{playing.title}</h3>
          {playing.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <p style={{ fontWeight: 600 }}>{i + 1}. {q.q}</p>
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))} style={{ display: "block", width: "100%", textAlign: "left", padding: 8, marginBottom: 4, borderRadius: 6, border: `1.5px solid ${answers[i] === oi ? COLORS.ink : COLORS.line}`, background: "#fff", cursor: "pointer" }}>{opt}</button>
              ))}
            </div>
          ))}
          <p>Score : {score} / {playing.questions.length}</p>
          <Btn ghost onClick={() => { setPlaying(null); setAnswers({}); }}>Fermer</Btn>
        </div>
      ) : items.length === 0 ? <Empty text="Aucune activité." /> : items.map((a) => (
        <div key={a.id} style={{ ...cardStyle, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>{a.title}</strong>
          <Btn onClick={() => { setPlaying(a); setAnswers({}); }}>{profile.role === "enseignant" ? "Aperçu" : "Commencer"}</Btn>
        </div>
      ))}
    </div>
  );
}

/* ---------------- GRILLES ---------------- */
function GrillesTab() {
  return (
    <div>
      <SectionHeader title="Grilles d'évaluation" subtitle="Générateur NCLC intégré." />
      <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <iframe title="Générateur de grilles NCLC" src="/generateur-grilles.html" style={{ width: "100%", height: "82vh", minHeight: 640, border: "none" }} />
      </div>
      <p style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
        Placez votre fichier <code>generateur-grilles.html</code> dans le dossier <code>public/</code> du projet pour qu'il s'affiche ici.
      </p>
    </div>
  );
}

/* ---------------- DEVOIRS ---------------- */
function DevoirsTab({ supabase, profile }) {
  const [assignments, setAssignments] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [subsByAssignment, setSubsByAssignment] = useState({});
  const [answerDraft, setAnswerDraft] = useState({});
  const [correcting, setCorrecting] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("assignments").select("*").order("created_at", { ascending: false });
    setAssignments(data || []);
    const { data: subs } = await supabase.from("submissions").select("*");
    const grouped = {};
    (subs || []).forEach((s) => { (grouped[s.assignment_id] ||= []).push(s); });
    setSubsByAssignment(grouped);
  }, [supabase]);
  useEffect(() => { load(); }, [load]);

  const publish = async () => {
    if (!title.trim() || !instructions.trim()) return;
    await supabase.from("assignments").insert({ owner_id: profile.id, title, instructions });
    setTitle(""); setInstructions(""); setOpen(false);
    load();
  };

  const submit = async (assignment) => {
    const text = (answerDraft[assignment.id] || "").trim();
    if (!text) return;
    setCorrecting(assignment.id);
    const { data: sub } = await supabase.from("submissions").insert({
      assignment_id: assignment.id, student_id: profile.id, answer_text: text, status: "en_attente",
    }).select().single();

    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentTitle: assignment.title, instructions: assignment.instructions, answerText: text }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await supabase.from("submissions").update({ status: "corrige", correction: json.correction }).eq("id", sub.id);
    } catch (e) {
      await supabase.from("submissions").update({ status: "erreur" }).eq("id", sub.id);
    } finally {
      setCorrecting(null);
      load();
    }
  };

  return (
    <div>
      <SectionHeader title="Devoirs & correction IA" subtitle="L'IA corrige automatiquement chaque réponse soumise." action={profile.role === "enseignant" && <Btn onClick={() => setOpen(true)}>+ Nouveau devoir</Btn>} />
      {open && (
        <div style={{ ...cardStyle, background: COLORS.paperDim, marginBottom: 16 }}>
          <F label="Titre"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></F>
          <F label="Instructions"><textarea style={{ ...inputStyle, minHeight: 80 }} value={instructions} onChange={(e) => setInstructions(e.target.value)} /></F>
          <Btn onClick={publish}>Soumettre à la classe</Btn> <Btn ghost onClick={() => setOpen(false)}>Annuler</Btn>
        </div>
      )}

      {assignments.length === 0 ? <Empty text="Aucun devoir." /> : assignments.map((a) => {
        const subs = subsByAssignment[a.id] || [];
        const mySub = subs.find((s) => s.student_id === profile.id);
        return (
          <div key={a.id} style={{ ...cardStyle, marginBottom: 14 }}>
            <strong>{a.title}</strong>
            <p style={{ fontSize: 13, color: "#666" }}>{a.instructions}</p>
            <hr style={{ border: "none", borderTop: `1px dashed ${COLORS.line}`, margin: "12px 0" }} />
            {profile.role === "enseignant" ? (
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>{subs.length} réponse(s)</span>
                {subs.map((s) => <SubCard key={s.id} s={s} supabase={supabase} isTeacher onUpdated={load} />)}
              </div>
            ) : !mySub ? (
              <>
                <textarea style={{ ...inputStyle, minHeight: 100 }} value={answerDraft[a.id] || ""} onChange={(e) => setAnswerDraft((d) => ({ ...d, [a.id]: e.target.value }))} />
                <div style={{ marginTop: 8 }}><Btn onClick={() => submit(a)} disabled={correcting === a.id}>{correcting === a.id ? "Envoi…" : "Soumettre pour correction"}</Btn></div>
              </>
            ) : <SubCard s={mySub} />}
          </div>
        );
      })}
    </div>
  );
}

function SubCard({ s, supabase, isTeacher, onUpdated }) {
  const c = s.correction;
  const [editing, setEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState(c?.note || "");
  const [commentDraft, setCommentDraft] = useState(c?.commentaire_general || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from("submissions").update({
      correction: { ...c, note: noteDraft, commentaire_general: commentDraft },
    }).eq("id", s.id);
    setSaving(false);
    setEditing(false);
    onUpdated?.();
  };

  return (
    <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 9, padding: 14, background: COLORS.paperDim, marginTop: 8 }}>
      <p style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{s.answer_text}</p>
      {s.status === "en_attente" && <p style={{ fontSize: 12, color: COLORS.amber }}>Correction en cours…</p>}
      {s.status === "erreur" && <p style={{ fontSize: 12, color: COLORS.rust }}>La correction a échoué.</p>}
      {s.status === "corrige" && c && editing ? (
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Note</label>
          <input style={{ ...inputStyle, marginBottom: 10 }} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Commentaire général</label>
          <textarea style={{ ...inputStyle, minHeight: 70, marginBottom: 10 }} value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} />
          <Btn onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Btn>{" "}
          <Btn ghost onClick={() => { setEditing(false); setNoteDraft(c.note); setCommentDraft(c.commentaire_general); }}>Annuler</Btn>
        </div>
      ) : s.status === "corrige" && c && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ color: COLORS.green, fontSize: 15 }}>{c.note}</strong>
            {isTeacher && <button onClick={() => setEditing(true)} style={{ fontSize: 12, background: "none", border: "none", color: COLORS.ink, cursor: "pointer", textDecoration: "underline" }}>Modifier</button>}
          </div>
          <p style={{ fontSize: 13 }}>{c.commentaire_general}</p>

          {c.points_forts?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.green }}>Points forts</span>
              <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 13 }}>
                {c.points_forts.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {c.points_a_ameliorer?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.amber }}>À améliorer</span>
              <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 13 }}>
                {c.points_a_ameliorer.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {c.erreurs_relevees?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.rust }}>Erreurs relevées</span>
              {c.erreurs_relevees.map((e, i) => (
                <div key={i} style={{ fontSize: 13, marginTop: 4 }}>
                  <span style={{ textDecoration: "line-through", color: COLORS.rust }}>{e.extrait}</span>
                  {" → "}
                  <span style={{ color: COLORS.green }}>{e.correction}</span>
                  <div style={{ fontSize: 12, color: "#777" }}>{e.explication}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- UI helpers ---------------- */
function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
      <div><h2 style={{ margin: 0, color: COLORS.ink }}>{title}</h2><p style={{ fontSize: 13, color: "#666" }}>{subtitle}</p></div>
      {action}
    </div>
  );
}
function F({ label, children }) { return <label style={{ display: "block", marginBottom: 12 }}><span style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{label}</span>{children}</label>; }
function Btn({ children, onClick, ghost, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: "9px 16px", borderRadius: 8, border: ghost ? "none" : "none", background: ghost ? "transparent" : COLORS.ink, color: ghost ? COLORS.ink : "#fff", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}>{children}</button>;
}
function Empty({ text }) { return <p style={{ textAlign: "center", color: "#888", padding: 40 }}>{text}</p>; }
