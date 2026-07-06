'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, ClipboardList, FolderOpen, LogOut, Send, Sparkles, Hourglass, ExternalLink,
  Megaphone, CheckCircle2, PlusCircle, Gauge, FileText, Youtube, Link2,
} from 'lucide-react';
import { signOut, submitAssignment, joinAnotherClass } from '@/app/actions';

const CATEGORY_BADGE = { Site: 'badge-bleu', Vidéo: 'badge-rouge', Outil: 'badge-vert', Podcast: 'badge-or', Document: 'badge-bleu' };
const ATTACHMENT_ICON = { Word: FileText, PDF: FileText, YouTube: Youtube, Autre: Link2 };

const ONGLETS = [
  { id: 'accueil', label: 'Accueil', icon: Home },
  { id: 'devoirs', label: 'Mes devoirs', icon: ClipboardList },
  { id: 'ressources', label: 'Ressources', icon: FolderOpen },
];

function formatDate(d) {
  if (!d) return null;
  return new Date(d + 'T12:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function StudentDashboard({ profile, classe, classes, announcements, assignments, resources, mySubmissions }) {
  const router = useRouter();
  const [tab, setTab] = useState('accueil');
  const [toast, setToast] = useState('');
  const [remiseDevoir, setRemiseDevoir] = useState(null);
  const [correctionDevoir, setCorrectionDevoir] = useState(null);
  const [joindreOuvert, setJoindreOuvert] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleSubmitTravail(e) {
    e.preventDefault();
    setEnvoiEnCours(true);
    const formData = new FormData(e.target);
    const result = await submitAssignment(remiseDevoir.id, formData);
    setEnvoiEnCours(false);
    if (result?.error) {
      showToast('⚠️ ' + result.error);
    } else {
      setRemiseDevoir(null);
      showToast('✅ Travail remis ! La correction IA sera bientôt disponible.');
    }
  }

  async function handleJoindre(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await joinAnotherClass(formData);
    if (result?.error) showToast('⚠️ ' + result.error);
    else {
      setJoindreOuvert(false);
      showToast('👋 Nouvelle classe rejointe !');
    }
  }

  const scores = mySubmissions
    .map((s) => (Array.isArray(s.corrections) ? s.corrections[0] : s.corrections))
    .filter(Boolean)
    .map((c) => c.score);
  const scoreMoyen = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div>
      <nav className="barre-nav">
        <div className="nav-logo">Carnet<span> de route</span> <span className="drapeau" role="img" aria-label="Drapeau du Canada">🇨🇦</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {classes.length > 1 && (
            <select
              value={classe.id}
              onChange={(e) => router.push('/apprenant?classe=' + e.target.value)}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.5rem', fontSize: '0.82rem' }}
            >
              {classes.map((c) => <option key={c.id} value={c.id} style={{ color: '#000' }}>{c.name}</option>)}
            </select>
          )}
          <div className="nav-info">
            <strong>{profile.full_name}</strong>
            <span>{classe.name}</span>
          </div>
          <form action={signOut}>
            <button className="nav-deconnexion" type="submit"><LogOut size={14} /> Se déconnecter</button>
          </form>
        </div>
      </nav>

      <div className="contenu-principal">
        <div className="stats-rangee">
          <div className="stat-tuile">
            <div className="stat-icone or"><ClipboardList size={20} /></div>
            <div><div className="stat-valeur">{assignments.length - mySubmissions.length}</div><div className="stat-etiquette">Devoirs à faire</div></div>
          </div>
          <div className="stat-tuile">
            <div className="stat-icone menthe"><CheckCircle2 size={20} /></div>
            <div><div className="stat-valeur">{mySubmissions.length}</div><div className="stat-etiquette">Devoirs remis</div></div>
          </div>
          <div className="stat-tuile">
            <div className="stat-icone"><Gauge size={20} /></div>
            <div><div className="stat-valeur">{scoreMoyen !== null ? scoreMoyen : '—'}</div><div className="stat-etiquette">Score moyen</div></div>
          </div>
          <div className="stat-tuile">
            <div className="stat-icone"><FolderOpen size={20} /></div>
            <div><div className="stat-valeur">{resources.length}</div><div className="stat-etiquette">Ressources disponibles</div></div>
          </div>
        </div>

        <div className="onglets">
          {ONGLETS.map(({ id, label, icon: Icon }) => (
            <div key={id} className={`onglet ${tab === id ? 'actif' : ''}`} onClick={() => setTab(id)}>
              <Icon size={15} /> {label}
            </div>
          ))}
          <div className="onglet" onClick={() => setJoindreOuvert(true)} style={{ marginLeft: 'auto' }}>
            <PlusCircle size={15} /> Rejoindre une classe
          </div>
        </div>

        {tab === 'accueil' && (
          <div>
            <div className="section-titre"><Megaphone size={19} /> Annonces de la classe</div>
            {announcements.length === 0 && (
              <div className="etat-vide">
                <div className="grande-icone"><Megaphone size={44} strokeWidth={1.4} /></div>
                <p>Aucune annonce pour l'instant.</p>
              </div>
            )}
            {announcements.map((a) => (
              <div className="annonce" key={a.id}>
                <div className="annonce-meta">{new Date(a.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })}</div>
                <h4>{a.title}</h4>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'devoirs' && (
          <div>
            <div className="section-titre"><ClipboardList size={19} /> Mes devoirs</div>
            <div className="grille">
              {assignments.length === 0 && (
                <div className="etat-vide">
                  <div className="grande-icone"><CheckCircle2 size={44} strokeWidth={1.4} /></div>
                  <p>Aucun devoir pour l'instant.<br />Votre enseignant·e en publiera bientôt.</p>
                </div>
              )}
              {assignments.map((d) => {
                const submission = mySubmissions.find((s) => s.assignment_id === d.id);
                const correction = submission ? (Array.isArray(submission.corrections) ? submission.corrections[0] : submission.corrections) : null;
                return (
                  <div className="carte" key={d.id}>
                    <div className="carte-entete">
                      <h3>{d.title}</h3>
                      <span className={`badge ${submission ? 'badge-vert' : 'badge-or'}`}>{submission ? 'Remis ✓' : 'À remettre'}</span>
                    </div>
                    <p>{d.instructions}</p>
                    <p className="carte-meta">{d.due_date ? `📅 ${formatDate(d.due_date)}` : 'Aucune date limite'}</p>
                    {d.attachment_url && (
                      <div style={{ marginTop: '0.6rem' }}>
                        <a href={d.attachment_url} target="_blank" rel="noreferrer" className="btn-sm btn-secondaire">
                          {(() => { const Icon = ATTACHMENT_ICON[d.attachment_type] || Link2; return <Icon size={13} />; })()}
                          {d.attachment_title || d.attachment_type}
                        </a>
                      </div>
                    )}
                    <div className="carte-actions">
                      {!submission && (
                        <button className="btn-sm btn-vert" onClick={() => setRemiseDevoir(d)}><Send size={13} /> Remettre</button>
                      )}
                      {submission && correction && (
                        <button className="btn-sm btn-secondaire" onClick={() => setCorrectionDevoir({ devoir: d, submission, correction })}>Voir ma correction</button>
                      )}
                      {submission && !correction && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--gris)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Hourglass size={13} /> Correction en cours…
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'ressources' && (
          <div>
            <div className="section-titre"><FolderOpen size={19} /> Ressources</div>
            <div className="grille">
              {resources.length === 0 && (
                <div className="etat-vide">
                  <div className="grande-icone"><FolderOpen size={44} strokeWidth={1.4} /></div>
                  <p>Aucune ressource pour l'instant.</p>
                </div>
              )}
              {resources.map((r) => (
                <div className="carte" key={r.id}>
                  <div className="carte-entete">
                    <h3>{r.title}</h3>
                    <span className={`badge ${CATEGORY_BADGE[r.category] || 'badge-bleu'}`}>{r.category}</span>
                  </div>
                  <p>{r.description || 'Ressource pédagogique'}</p>
                  <div className="carte-actions">
                    <a href={r.url} target="_blank" rel="noreferrer" className="btn-sm btn-primaire"><ExternalLink size={13} /> Ouvrir</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {remiseDevoir && (
        <div className="modale-fond" onClick={(e) => e.target === e.currentTarget && !envoiEnCours && setRemiseDevoir(null)}>
          <div className="modale">
            <h3>📤 Remettre : {remiseDevoir.title}</h3>
            <form onSubmit={handleSubmitTravail}>
              <div className="champ">
                <label>Votre travail (texte)</label>
                <textarea className="champ-texte" name="content" style={{ minHeight: 160 }} placeholder="Écrivez votre texte ici…" disabled={envoiEnCours} />
              </div>
              <div className="champ">
                <label>Ou téléverser un fichier PDF</label>
                <input type="file" name="file" accept="application/pdf" disabled={envoiEnCours} />
                <p style={{ fontSize: '0.78rem', color: 'var(--gris)', marginTop: '0.3rem' }}>Un des deux champs est requis (texte ou fichier).</p>
              </div>
              <div className="modale-actions">
                <button type="button" className="btn-sm btn-secondaire" onClick={() => setRemiseDevoir(null)} disabled={envoiEnCours}>Annuler</button>
                <button type="submit" className="btn-sm btn-vert" disabled={envoiEnCours}>
                  {envoiEnCours ? (<><Hourglass size={13} /> Correction IA en cours…</>) : (<><Send size={13} /> Remettre</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {correctionDevoir && (
        <div className="modale-fond" onClick={(e) => e.target === e.currentTarget && setCorrectionDevoir(null)}>
          <div className="modale" style={{ maxWidth: 640 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={20} /> Correction — {correctionDevoir.devoir.title}</h3>
            <div className="score-ia">
              <div className="score-cercle">{correctionDevoir.correction.score}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--gris)' }}>Score global sur 100</p>
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Texte annoté :</p>
            <div className="correction-bloc">{correctionDevoir.correction.annotated_text}</div>
            {Array.isArray(correctionDevoir.correction.criteria) && correctionDevoir.correction.criteria.length > 0 && (
              <div style={{ margin: '1rem 0' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Critères d'évaluation :</p>
                {correctionDevoir.correction.criteria.map((c, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <span className={`badge ${c.met ? 'badge-vert' : 'badge-rouge'}`} style={{ flexShrink: 0 }}>{c.met ? '✓' : '✗'}</span>
                    <span><strong>{c.label}</strong> — {c.comment}</span>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}><strong>Ce que vous avez bien réussi :</strong> {correctionDevoir.correction.feedback_strengths}</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}><strong>Ce qu'il faut travailler :</strong> {correctionDevoir.correction.feedback_improve}</p>
            <div className="modale-actions">
              <button className="btn-sm btn-secondaire" onClick={() => setCorrectionDevoir(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {joindreOuvert && (
        <div className="modale-fond" onClick={(e) => e.target === e.currentTarget && setJoindreOuvert(false)}>
          <div className="modale">
            <h3>➕ Rejoindre une autre classe</h3>
            <form onSubmit={handleJoindre}>
              <div className="champ">
                <label>Code de classe</label>
                <input type="text" name="code" placeholder="ex. FLS-4872" style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }} required />
              </div>
              <div className="modale-actions">
                <button type="button" className="btn-sm btn-secondaire" onClick={() => setJoindreOuvert(false)}>Annuler</button>
                <button type="submit" className="btn-sm btn-primaire">Rejoindre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
