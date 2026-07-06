'use client';

import { useState } from 'react';
import { Copy, Megaphone, ClipboardList, Users, FolderOpen, LogOut, Trash2, ExternalLink, Sparkles, CheckCircle2, Hourglass, FileText, Youtube, Link2, ListChecks } from 'lucide-react';
import {
  signOut,
  postAnnouncement,
  createAssignment,
  deleteAssignment,
  addResource,
  deleteResource,
} from '@/app/actions';

const CATEGORY_BADGE = { Site: 'badge-bleu', Vidéo: 'badge-rouge', Outil: 'badge-vert', Podcast: 'badge-or', Document: 'badge-bleu' };

const ATTACHMENT_ICON = { Word: FileText, PDF: FileText, YouTube: Youtube, Autre: Link2 };

const ONGLETS = [
  { id: 'annonces', label: 'Annonces', icon: Megaphone },
  { id: 'devoirs', label: 'Devoirs', icon: ClipboardList },
  { id: 'apprenants', label: 'Apprenants', icon: Users },
  { id: 'ressources', label: 'Ressources', icon: FolderOpen },
];

function formatDate(d) {
  if (!d) return null;
  return new Date(d + 'T12:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TeacherDashboard({ profile, classe, announcements, assignments, members, resources, submissions }) {
  const [tab, setTab] = useState('annonces');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [remisesDevoir, setRemisesDevoir] = useState(null);
  const [attachmentMode, setAttachmentMode] = useState('aucune');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function copierCode() {
    navigator.clipboard?.writeText(classe.code).catch(() => {});
    showToast('📋 Code copié : ' + classe.code);
  }

  async function handleSubmit(e, action, successMsg) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await action(formData);
    if (result?.error) {
      showToast('⚠️ ' + result.error);
    } else {
      setModal(null);
      showToast(successMsg);
      e.target.reset();
    }
  }

  const membersWithProgress = members.map((m) => {
    const done = submissions.filter((s) => s.student_id === m.student_id).length;
    const total = assignments.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...m, done, total, pct };
  });

  const totalRemises = submissions.length;

  return (
    <div>
      <nav className="barre-nav">
        <div className="nav-logo">Carnet<span> de route</span> <span className="drapeau" role="img" aria-label="Drapeau du Canada">🇨🇦</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="nav-code" onClick={copierCode} title="Cliquez pour copier"><Copy size={14} /> {classe.code}</button>
          <div className="nav-info">
            <strong>{profile.full_name}</strong>
            <span>{classe.name} · {classe.level}</span>
          </div>
          <form action={signOut}>
            <button className="nav-deconnexion" type="submit"><LogOut size={14} /> Se déconnecter</button>
          </form>
        </div>
      </nav>

      <div className="contenu-principal">
        <div className="stats-rangee">
          <div className="stat-tuile">
            <div className="stat-icone"><Users size={20} /></div>
            <div><div className="stat-valeur">{members.length}</div><div className="stat-etiquette">Apprenants inscrits</div></div>
          </div>
          <div className="stat-tuile">
            <div className="stat-icone or"><ClipboardList size={20} /></div>
            <div><div className="stat-valeur">{assignments.length}</div><div className="stat-etiquette">Devoirs actifs</div></div>
          </div>
          <div className="stat-tuile">
            <div className="stat-icone menthe"><CheckCircle2 size={20} /></div>
            <div><div className="stat-valeur">{totalRemises}</div><div className="stat-etiquette">Remises reçues</div></div>
          </div>
          <div className="stat-tuile">
            <div className="stat-icone"><FolderOpen size={20} /></div>
            <div><div className="stat-valeur">{resources.length}</div><div className="stat-etiquette">Ressources partagées</div></div>
          </div>
        </div>

        <div className="onglets">
          {ONGLETS.map(({ id, label, icon: Icon }) => (
            <div key={id} className={`onglet ${tab === id ? 'actif' : ''}`} onClick={() => setTab(id)}>
              <Icon size={15} /> {label}
            </div>
          ))}
        </div>

        {tab === 'annonces' && (
          <div>
            <div className="section-entete">
              <div className="section-titre"><Megaphone size={19} /> Annonces</div>
              <button className="btn-sm btn-primaire" onClick={() => setModal('annonce')}>+ Nouvelle annonce</button>
            </div>
            {announcements.length === 0 && (
              <div className="etat-vide">
                <div className="grande-icone"><Megaphone size={44} strokeWidth={1.4} /></div>
                <p>Aucune annonce pour l'instant.</p>
              </div>
            )}
            {announcements.map((a) => (
              <div className="annonce" key={a.id}>
                <div className="annonce-meta">{new Date(a.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })} · {profile.full_name}</div>
                <h4>{a.title}</h4>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'devoirs' && (
          <div>
            <div className="section-entete">
              <div className="section-titre"><ClipboardList size={19} /> Devoirs</div>
              <button className="btn-sm btn-primaire" onClick={() => { setAttachmentMode('aucune'); setModal('devoir'); }}>+ Créer un devoir</button>
            </div>
            <div className="grille">
              {assignments.length === 0 && (
                <div className="etat-vide">
                  <div className="grande-icone"><ClipboardList size={44} strokeWidth={1.4} /></div>
                  <p>Aucun devoir pour l'instant.<br />Créez votre premier devoir en cliquant sur le bouton ci-dessus.</p>
                </div>
              )}
              {assignments.map((d) => {
                const remisCount = submissions.filter((s) => s.assignment_id === d.id).length;
                return (
                  <div className="carte" key={d.id}>
                    <div className="carte-entete">
                      <h3>{d.title}</h3>
                      <span className="badge badge-bleu">{d.assignment_type}</span>
                    </div>
                    <p>{d.instructions}</p>
                    <p className="carte-meta">
                      {d.due_date ? `📅 ${formatDate(d.due_date)}` : 'Aucune date limite'} · {remisCount} / {members.length} remis
                    </p>
                    {Array.isArray(d.evaluation_questions) && d.evaluation_questions.length > 0 && (
                      <p className="carte-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ListChecks size={13} /> {d.evaluation_questions.length} critère{d.evaluation_questions.length > 1 ? 's' : ''} d'évaluation pour l'IA
                      </p>
                    )}
                    {d.attachment_url && (
                      <div style={{ marginTop: '0.6rem' }}>
                        <a href={d.attachment_url} target="_blank" rel="noreferrer" className="btn-sm btn-secondaire">
                          {(() => { const Icon = ATTACHMENT_ICON[d.attachment_type] || Link2; return <Icon size={13} />; })()}
                          {d.attachment_title || d.attachment_type}
                        </a>
                      </div>
                    )}
                    <div className="carte-actions">
                      <button className="btn-sm btn-secondaire" onClick={() => setRemisesDevoir(d)}>Voir les remises</button>
                      <button
                        className="btn-sm btn-danger"
                        onClick={async () => {
                          const result = await deleteAssignment(d.id);
                          if (result?.error) showToast('⚠️ ' + result.error);
                          else showToast('🗑️ Devoir supprimé.');
                        }}
                      >
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'apprenants' && (
          <div>
            <div className="section-titre"><Users size={19} /> Apprenants inscrits</div>
            <div className="tableau-apprenants">
              <table>
                <thead>
                  <tr>
                    <th>Apprenant</th>
                    <th>Inscrit le</th>
                    <th>Devoirs remis</th>
                    <th>Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {membersWithProgress.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gris)', padding: '3rem' }}>
                      En attente d'apprenants — partagez le code <strong>{classe.code}</strong>
                    </td></tr>
                  )}
                  {membersWithProgress.map((m) => {
                    const initiales = (m.profiles?.full_name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <tr key={m.student_id}>
                        <td><span className="avatar">{initiales}</span>{m.profiles?.full_name}</td>
                        <td>{new Date(m.joined_at).toLocaleDateString('fr-CA')}</td>
                        <td><span className="badge badge-or">{m.done} / {m.total}</span></td>
                        <td>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gris)', marginBottom: 2 }}>{m.pct}%</div>
                          <div className="barre-progression"><div className="barre-remplie" style={{ width: m.pct + '%' }} /></div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'ressources' && (
          <div>
            <div className="section-entete">
              <div className="section-titre"><FolderOpen size={19} /> Ressources partagées</div>
              <button className="btn-sm btn-primaire" onClick={() => setModal('ressource')}>+ Ajouter un lien</button>
            </div>
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
                    <button
                      className="btn-sm btn-danger"
                      onClick={async () => {
                        const result = await deleteResource(r.id);
                        if (result?.error) showToast('⚠️ ' + result.error);
                        else showToast('🗑️ Ressource supprimée.');
                      }}
                    >
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal === 'annonce' && (
        <div className="modale-fond" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modale">
            <h3>📢 Nouvelle annonce</h3>
            <form onSubmit={(e) => handleSubmit(e, (fd) => postAnnouncement(classe.id, fd), '📢 Annonce publiée !')}>
              <div className="champ"><label>Titre</label><input type="text" name="title" placeholder="ex. Rappel : cours annulé vendredi" required /></div>
              <div className="champ"><label>Message</label><textarea className="champ-texte" name="body" placeholder="Écrivez votre message ici…" required /></div>
              <div className="modale-actions">
                <button type="button" className="btn-sm btn-secondaire" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn-sm btn-primaire">Publier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'devoir' && (
        <div className="modale-fond" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modale">
            <h3>📝 Créer un devoir</h3>
            <form onSubmit={(e) => handleSubmit(e, (fd) => createAssignment(classe.id, fd), '📝 Devoir publié !')}>
              <div className="champ"><label>Titre du devoir</label><input type="text" name="title" placeholder="ex. Rédaction — ma ville idéale" required /></div>
              <div className="champ"><label>Consigne</label><textarea className="champ-texte" name="instructions" placeholder="Décrivez la tâche à accomplir…" required /></div>
              <div className="rangee">
                <div className="champ"><label>Date limite</label><input type="date" name="dueDate" /></div>
                <div className="champ">
                  <label>Type</label>
                  <select name="assignmentType" defaultValue="Rédaction">
                    <option>Rédaction</option>
                    <option>Exercice de grammaire</option>
                    <option>Compréhension orale</option>
                    <option>Vocabulaire</option>
                    <option>Présentation orale</option>
                    <option>Lecture</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
              <div className="champ"><label>Niveau NCLC (optionnel)</label><input type="text" name="nclcLevel" placeholder="ex. 5" /></div>

              <div className="champ">
                <label>Pièce jointe (optionnel)</label>
                <select name="attachmentMode" value={attachmentMode} onChange={(e) => setAttachmentMode(e.target.value)}>
                  <option value="aucune">Aucune</option>
                  <option value="lien">Lien (YouTube, Google Docs, etc.)</option>
                  <option value="fichier">Téléverser un fichier (PDF, Word)</option>
                </select>
              </div>

              {attachmentMode === 'lien' && (
                <div className="rangee">
                  <div className="champ">
                    <label>Type</label>
                    <select name="attachmentType" defaultValue="YouTube">
                      <option>Word</option>
                      <option>PDF</option>
                      <option>YouTube</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div className="champ">
                    <label>Lien de la pièce jointe</label>
                    <input type="url" name="attachmentUrl" placeholder="https://…" required />
                  </div>
                </div>
              )}

              {attachmentMode === 'fichier' && (
                <div className="champ">
                  <label>Fichier (PDF ou Word)</label>
                  <input type="file" name="attachmentFile" accept=".pdf,.doc,.docx" required />
                </div>
              )}

              {attachmentMode !== 'aucune' && (
                <div className="champ"><label>Titre de la pièce jointe (optionnel)</label><input type="text" name="attachmentTitle" placeholder="ex. Vidéo — le passé composé" /></div>
              )}

              <div className="champ">
                <label>Questions d'évaluation pour l'IA (optionnel, une par ligne)</label>
                <textarea
                  className="champ-texte"
                  name="evaluationQuestions"
                  placeholder={"ex.\nLe texte respecte-t-il le sujet demandé ?\nLe passé composé est-il utilisé correctement ?\nLe texte contient-il au moins 150 mots ?"}
                  style={{ minHeight: 90 }}
                />
              </div>

              <div className="modale-actions">
                <button type="button" className="btn-sm btn-secondaire" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn-sm btn-primaire">Publier le devoir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'ressource' && (
        <div className="modale-fond" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modale">
            <h3>📁 Ajouter une ressource</h3>
            <form onSubmit={(e) => handleSubmit(e, (fd) => addResource(classe.id, fd), '📁 Ressource ajoutée !')}>
              <div className="champ"><label>Titre</label><input type="text" name="title" placeholder="ex. Exercices de conjugaison" required /></div>
              <div className="champ"><label>URL</label><input type="url" name="url" placeholder="https://…" required /></div>
              <div className="champ"><label>Description courte</label><input type="text" name="description" placeholder="ex. 20 exercices sur les temps du passé" /></div>
              <div className="champ">
                <label>Catégorie</label>
                <select name="category" defaultValue="Site">
                  <option>Site</option>
                  <option>Vidéo</option>
                  <option>Outil</option>
                  <option>Podcast</option>
                  <option>Document</option>
                </select>
              </div>
              <div className="modale-actions">
                <button type="button" className="btn-sm btn-secondaire" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn-sm btn-primaire">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {remisesDevoir && (
        <div className="modale-fond" onClick={(e) => e.target === e.currentTarget && setRemisesDevoir(null)}>
          <div className="modale" style={{ maxWidth: 640 }}>
            <h3>📤 Remises — {remisesDevoir.title}</h3>
            {submissions.filter((s) => s.assignment_id === remisesDevoir.id).length === 0 && (
              <p style={{ color: 'var(--gris)', fontSize: '0.9rem' }}>Aucune remise pour l'instant.</p>
            )}
            {submissions.filter((s) => s.assignment_id === remisesDevoir.id).map((s) => {
              const correction = Array.isArray(s.corrections) ? s.corrections[0] : s.corrections;
              return (
                <div key={s.id} style={{ borderBottom: '1px solid var(--bordure)', padding: '1rem 0' }}>
                  <strong>{s.profiles?.full_name}</strong>
                  {s.content && <p style={{ fontSize: '0.85rem', color: 'var(--gris)', margin: '0.4rem 0' }}>{s.content}</p>}
                  {s.file_url && (
                    <p style={{ margin: '0.4rem 0' }}>
                      <a href={s.file_url} target="_blank" rel="noreferrer" className="btn-sm btn-secondaire">
                        <FileText size={13} /> {s.file_name || 'Fichier PDF remis'}
                      </a>
                    </p>
                  )}
                  {correction ? (
                    <>
                      <div className="score-ia">
                        <div className="score-cercle">{correction.score}</div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--menthe)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Sparkles size={15} /> Corrigé par l'IA
                          </p>
                        </div>
                      </div>
                      {Array.isArray(correction.criteria) && correction.criteria.length > 0 && (
                        <div style={{ margin: '0.6rem 0' }}>
                          {correction.criteria.map((c, i) => (
                            <div key={i} style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                              <span className={`badge ${c.met ? 'badge-vert' : 'badge-rouge'}`} style={{ flexShrink: 0 }}>{c.met ? '✓' : '✗'}</span>
                              <span><strong>{c.label}</strong> — {c.comment}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p style={{ fontSize: '0.85rem' }}><strong>Réussi :</strong> {correction.feedback_strengths}</p>
                      <p style={{ fontSize: '0.85rem' }}><strong>À travailler :</strong> {correction.feedback_improve}</p>
                    </>
                  ) : (
                    <span className="badge badge-or" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Hourglass size={12} /> Correction en cours…
                    </span>
                  )}
                </div>
              );
            })}
            <div className="modale-actions">
              <button className="btn-sm btn-secondaire" onClick={() => setRemisesDevoir(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
