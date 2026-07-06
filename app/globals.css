@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root {
  --bleu: #1B3A6B;
  --ciel: #3B82F6;
  --menthe: #10B981;
  --sable: #F5F0E8;
  --encre: #1A1A2E;
  --gris: #6B7280;
  --bordure: #E5E0D5;
  --blanc: #FFFFFF;
  --rouge: #EF4444;
  --or: #F59E0B;

  --font-serif: 'Fraunces', 'Sora', serif;
  --ombre-sm: 0 1px 2px rgba(27,58,107,0.06), 0 1px 3px rgba(27,58,107,0.08);
  --ombre-md: 0 4px 16px rgba(27,58,107,0.08), 0 2px 6px rgba(27,58,107,0.06);
  --ombre-lg: 0 20px 45px rgba(27,58,107,0.16), 0 6px 16px rgba(27,58,107,0.08);
}

.titre-serif {
  font-family: var(--font-serif);
  font-weight: 600;
  letter-spacing: -0.01em;
  font-style: italic;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  font-family: 'Sora', sans-serif;
  background: var(--sable);
  color: var(--encre);
  min-height: 100vh;
}

a { color: inherit; }

/* ─── ÉCRAN D'ACCUEIL ─── */
.ecran-accueil {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bleu) 0%, #2563EB 60%, var(--ciel) 100%);
}

.logo-accueil {
  font-family: var(--font-serif);
  font-size: 3.2rem;
  font-weight: 600;
  font-style: italic;
  color: var(--blanc);
  letter-spacing: -0.01em;
  margin-bottom: 0.3rem;
  text-align: center;
}

.logo-accueil span { color: #93C5FD; }

.drapeau {
  font-size: 0.5em;
  font-style: normal;
  vertical-align: middle;
  display: inline-block;
  margin-left: 0.15em;
}

.nav-logo .drapeau { font-size: 0.85em; margin-left: 0.3rem; }

.tagline {
  color: #BFDBFE;
  font-size: 0.95rem;
  font-weight: 300;
  margin-bottom: 3rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
}

.cartes-choix {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.carte-role {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 220px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  backdrop-filter: blur(8px);
  text-decoration: none;
  display: block;
}

.carte-role:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.5);
}

.carte-role .icone { margin-bottom: 1rem; display: flex; justify-content: center; color: var(--blanc); }
.carte-role h2 { color: var(--blanc); font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
.carte-role p { color: #BFDBFE; font-size: 0.8rem; font-weight: 300; line-height: 1.5; }

/* ─── PAGE PUBLIQUE — MODULES & ÉTAPES ─── */
.section-publique { background: var(--sable); padding: 5rem 1.5rem; }
.section-publique-conteneur { max-width: 1080px; margin: 0 auto; }

.section-publique-titre {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 2rem;
  font-weight: 600;
  color: var(--bleu);
  text-align: center;
  margin-bottom: 0.6rem;
}

.section-publique-sous-titre {
  text-align: center;
  color: var(--gris);
  font-size: 0.95rem;
  max-width: 560px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.modules-grille {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.5rem;
}

.module-carte {
  background: var(--blanc);
  border: 1.5px solid var(--bordure);
  border-radius: 16px;
  padding: 1.8rem;
  transition: box-shadow 0.2s, transform 0.2s;
}

.module-carte:hover { box-shadow: var(--ombre-md); transform: translateY(-3px); }

.module-icone {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ciel), var(--bleu));
  color: var(--blanc);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.1rem;
}

.module-carte h3 { font-size: 1.02rem; font-weight: 700; color: var(--encre); margin-bottom: 0.5rem; }
.module-carte p { font-size: 0.85rem; color: var(--gris); line-height: 1.6; }

.etapes-grille {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  counter-reset: etape;
}

.etape { text-align: center; }

.etape-numero {
  counter-increment: etape;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bleu);
  color: var(--blanc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-weight: 600;
  margin: 0 auto 1rem;
}

.etape-numero::before { content: counter(etape); }

.etape h3 { font-size: 0.95rem; font-weight: 700; color: var(--encre); margin-bottom: 0.4rem; }
.etape p { font-size: 0.83rem; color: var(--gris); line-height: 1.6; }

.cta-bandeau {
  background: linear-gradient(135deg, var(--bleu) 0%, #2563EB 100%);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--blanc);
}

.cta-bandeau h2 { font-family: var(--font-serif); font-style: italic; font-size: 1.7rem; margin-bottom: 0.6rem; }
.cta-bandeau p { color: #BFDBFE; margin-bottom: 1.6rem; font-size: 0.9rem; }

.cta-boutons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

.btn-cta {
  padding: 0.75rem 1.6rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: transform 0.15s, box-shadow 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cta:hover { transform: translateY(-2px); }
.btn-cta-plein { background: var(--blanc); color: var(--bleu); }
.btn-cta-plein:hover { box-shadow: var(--ombre-md); }
.btn-cta-contour { background: rgba(255,255,255,0.1); color: var(--blanc); border: 1.5px solid rgba(255,255,255,0.4); }
.btn-cta-contour:hover { background: rgba(255,255,255,0.18); }

/* ─── FORMULAIRES ─── */
.ecran-form {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bleu) 0%, #1E40AF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  flex-direction: column;
}

.form-carte {
  background: var(--blanc);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--ombre-lg);
}

.form-carte h2 { font-size: 1.4rem; font-weight: 700; color: var(--bleu); margin-bottom: 0.3rem; }
.form-carte p.sous-titre { font-size: 0.85rem; color: var(--gris); margin-bottom: 2rem; }

.champ { margin-bottom: 1.2rem; }

.champ label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gris);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.4rem;
}

.champ input, .champ select, textarea.champ-texte {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--bordure);
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  color: var(--encre);
  background: var(--sable);
  transition: border-color 0.2s;
  outline: none;
}

.champ input:focus, .champ select:focus, textarea.champ-texte:focus {
  border-color: var(--ciel);
  background: var(--blanc);
}

textarea.champ-texte { resize: vertical; min-height: 100px; }

.btn-principal {
  width: 100%;
  padding: 0.85rem;
  background: var(--bleu);
  color: var(--blanc);
  border: none;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  margin-top: 0.5rem;
}

.btn-principal:hover { background: #162E57; transform: translateY(-1px); }
.btn-principal:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.lien-retour {
  color: #BFDBFE;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1.2rem;
  text-decoration: underline;
  background: none;
  border: none;
}

.erreur-form {
  background: #FEE2E2;
  color: #991B1B;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.82rem;
  margin-bottom: 1rem;
}

.code-classe {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 2rem;
  font-weight: 500;
  color: var(--ciel);
  letter-spacing: 0.15em;
  background: #EFF6FF;
  border: 2px dashed #BFDBFE;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  margin: 1rem 0;
}

/* ─── NAV / TABLEAU DE BORD ─── */
.barre-nav {
  background: var(--bleu);
  color: var(--blanc);
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

.nav-logo { font-size: 1.2rem; font-weight: 700; letter-spacing: -0.02em; }
.nav-logo span { color: #93C5FD; }
.nav-info { font-size: 0.8rem; color: #BFDBFE; text-align: right; }
.nav-info strong { display: block; color: var(--blanc); font-size: 0.9rem; }

.nav-code {
  font-family: 'IBM Plex Mono', monospace;
  background: rgba(255,255,255,0.15);
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
  border: none;
  color: var(--blanc);
}

.nav-code:hover { background: rgba(255,255,255,0.25); }

.nav-deconnexion {
  background: none;
  border: 1px solid rgba(255,255,255,0.3);
  color: var(--blanc);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.contenu-principal { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }

.section-titre {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--bleu);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.section-entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
  gap: 0.8rem;
}

/* ─── ONGLETS ─── */
.onglets { display: flex; gap: 0.4rem; margin-bottom: 1.5rem; flex-wrap: wrap; }

.onglet {
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid var(--bordure);
  transition: all 0.2s;
  background: var(--blanc);
  color: var(--gris);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.onglet.actif { background: var(--bleu); color: var(--blanc); border-color: var(--bleu); }
.onglet:hover:not(.actif) { border-color: var(--ciel); color: var(--ciel); }

/* ─── GRILLE DE CARTES ─── */
.grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.2rem; }

.carte {
  background: var(--blanc);
  border: 1.5px solid var(--bordure);
  border-radius: 14px;
  padding: 1.5rem;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
}

.carte:hover { box-shadow: var(--ombre-md); transform: translateY(-2px); border-color: #D9E4F5; }

/* ─── STAT TILES ─── */
.stats-rangee {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.8rem;
}

.stat-tuile {
  background: var(--blanc);
  border: 1.5px solid var(--bordure);
  border-radius: 14px;
  padding: 1.1rem 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  transition: box-shadow 0.2s, transform 0.2s;
}

.stat-tuile:hover { box-shadow: var(--ombre-sm); transform: translateY(-1px); }

.stat-icone {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #EFF6FF;
  color: var(--bleu);
}

.stat-icone.menthe { background: #ECFDF5; color: #047857; }
.stat-icone.or { background: #FFFBEB; color: #92400E; }
.stat-icone.rouge { background: #FEF2F2; color: #B91C1C; }

.stat-valeur { font-size: 1.5rem; font-weight: 700; color: var(--encre); line-height: 1.1; }
.stat-etiquette { font-size: 0.78rem; color: var(--gris); margin-top: 0.15rem; }

.carte-entete { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem; gap: 0.5rem; }
.carte h3 { font-size: 1rem; font-weight: 600; color: var(--encre); }

.badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.badge-vert { background: #D1FAE5; color: #065F46; }
.badge-bleu { background: #DBEAFE; color: #1E40AF; }
.badge-or { background: #FEF3C7; color: #92400E; }
.badge-rouge { background: #FEE2E2; color: #991B1B; }

.carte p { font-size: 0.85rem; color: var(--gris); line-height: 1.6; }
.carte-meta { margin-top: 0.6rem; font-size: 0.78rem; color: var(--gris); }
.carte-actions { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }

.btn-sm {
  padding: 0.4rem 0.9rem;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  font-family: 'Sora', sans-serif;
  transition: all 0.15s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-sm:active { transform: scale(0.97); }
.btn-sm svg, .btn-principal svg, .nav-code svg, .nav-deconnexion svg { flex-shrink: 0; }

.btn-primaire { background: var(--bleu); color: var(--blanc); border-color: var(--bleu); }
.btn-primaire:hover { background: #162E57; }
.btn-primaire:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondaire { background: transparent; color: var(--bleu); border-color: #BFDBFE; }
.btn-secondaire:hover { background: #EFF6FF; }
.btn-danger { background: transparent; color: var(--rouge); border-color: #FECACA; }
.btn-danger:hover { background: #FEE2E2; }
.btn-vert { background: var(--menthe); color: var(--blanc); border-color: var(--menthe); }
.btn-vert:hover { background: #0D9668; }

/* ─── FORMULAIRE SECTION ─── */
.formulaire-section {
  background: var(--blanc);
  border: 1.5px solid var(--bordure);
  border-radius: 14px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.formulaire-section h3 { font-size: 1rem; font-weight: 700; color: var(--bleu); margin-bottom: 1.2rem; }
.rangee { display: flex; gap: 1rem; flex-wrap: wrap; }
.rangee .champ { flex: 1; min-width: 200px; }

/* ─── TABLEAU ─── */
.tableau-apprenants { background: var(--blanc); border-radius: 14px; overflow: hidden; border: 1.5px solid var(--bordure); overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }

th {
  background: var(--bleu);
  color: var(--blanc);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.9rem 1.2rem;
  text-align: left;
  white-space: nowrap;
}

td { padding: 0.9rem 1.2rem; font-size: 0.88rem; color: var(--encre); border-bottom: 1px solid var(--bordure); }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #F8FAFC; }

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ciel), var(--bleu));
  color: var(--blanc);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 0.6rem;
  vertical-align: middle;
}

/* ─── ANNONCES ─── */
.annonce {
  background: var(--blanc);
  border-radius: 0 12px 12px 0;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1rem;
  border: 1.5px solid var(--bordure);
  border-left: 4px solid var(--ciel);
}

.annonce-meta { font-size: 0.78rem; color: var(--gris); margin-bottom: 0.5rem; font-family: 'IBM Plex Mono', monospace; }
.annonce h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.3rem; }
.annonce p { font-size: 0.85rem; color: var(--gris); line-height: 1.6; white-space: pre-wrap; }

/* ─── PROGRESSION ─── */
.barre-progression { background: #E5E7EB; border-radius: 20px; height: 8px; overflow: hidden; margin-top: 0.4rem; }
.barre-remplie { height: 100%; border-radius: 20px; background: linear-gradient(90deg, var(--ciel), var(--menthe)); transition: width 0.6s ease; }

/* ─── MODALE ─── */
.modale-fond {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modale {
  background: var(--blanc);
  border-radius: 18px;
  padding: 2rem;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 60px rgba(0,0,0,0.3);
  animation: entree 0.25s ease;
}

@keyframes entree { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modale h3 { font-size: 1.2rem; font-weight: 700; color: var(--bleu); margin-bottom: 1.5rem; }
.modale-actions { display: flex; justify-content: flex-end; gap: 0.7rem; margin-top: 1.5rem; }

/* ─── TOAST ─── */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--encre);
  color: var(--blanc);
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 500;
  z-index: 300;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 90vw;
  animation: toast-entree 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@keyframes toast-entree {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ─── ÉTAT VIDE ─── */
.etat-vide { text-align: center; padding: 4rem 2rem; color: var(--gris); grid-column: 1 / -1; }
.etat-vide .grande-icone { font-size: 3rem; margin-bottom: 1rem; }
.etat-vide p { font-size: 0.9rem; line-height: 1.6; }

/* ─── CORRECTION IA ─── */
.correction-bloc { background: var(--sable); border-radius: 10px; padding: 1rem; font-size: 0.9rem; line-height: 1.9; white-space: pre-wrap; }
.correction-erreur { background: #FEE2E2; border-bottom: 2px solid var(--rouge); padding: 0 3px; border-radius: 2px; }
.score-ia { display: flex; align-items: center; gap: 1rem; margin: 1rem 0; }
.score-cercle {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, var(--ciel), var(--menthe));
  color: var(--blanc); display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 700; flex-shrink: 0;
}

@media (max-width: 640px) {
  .barre-nav { padding: 0 1rem; }
  .contenu-principal { padding: 1.2rem 1rem; }
  th, td { padding: 0.7rem 0.8rem; }
}
