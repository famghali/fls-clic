import Link from 'next/link';
import { redirect } from 'next/navigation';
import { GraduationCap, BookOpen, FolderOpen, ClipboardList, LayoutGrid, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

const MODULES = [
  {
    icon: FolderOpen,
    title: 'Documents & ressources',
    text: "Partagez des liens, vidéos et fiches pédagogiques classés par catégorie, accessibles à toute la classe.",
  },
  {
    icon: ClipboardList,
    title: 'Activités & devoirs',
    text: "Créez des devoirs avec consigne, type d'activité, date limite et niveau NCLC — suivis en un coup d'œil.",
  },
  {
    icon: LayoutGrid,
    title: 'Grilles d’évaluation',
    text: "Des critères clairs par devoir, pour une évaluation cohérente et transparente pour vos apprenants.",
  },
  {
    icon: Sparkles,
    title: 'Correction par l’IA',
    text: "Chaque remise est analysée automatiquement : erreurs, score et rétroaction détaillée, en quelques secondes.",
  },
];

const ETAPES = [
  { title: "Créez votre classe", text: "En tant qu'enseignant·e, ouvrez un compte et obtenez un code de classe unique à partager." },
  { title: 'Vos apprenants rejoignent', text: 'Ils créent un compte et entrent simplement votre code — aucune configuration requise.' },
  { title: 'Publiez et corrigez', text: "Annonces, devoirs, ressources — et une correction IA instantanée à chaque remise." },
];

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'enseignant') redirect('/enseignant');
    if (profile?.role === 'apprenant') redirect('/apprenant');
  }

  return (
    <>
      <div className="ecran-accueil">
        <div className="logo-accueil">Carnet de route <span>linguistique</span> <span className="drapeau" role="img" aria-label="Drapeau du Canada">🇨🇦</span></div>
        <div className="tagline">Enseignement du français langue seconde</div>
        <div className="cartes-choix">
          <Link href="/enseignant/inscription" className="carte-role">
            <div className="icone"><GraduationCap size={44} strokeWidth={1.5} /></div>
            <h2>Enseignant·e</h2>
            <p>Créez votre classe, publiez des devoirs et suivez vos apprenants</p>
          </Link>
          <Link href="/apprenant/inscription" className="carte-role">
            <div className="icone"><BookOpen size={44} strokeWidth={1.5} /></div>
            <h2>Apprenant·e</h2>
            <p>Rejoignez votre classe avec le code fourni par votre enseignant·e</p>
          </Link>
        </div>
      </div>

      <section className="section-publique">
        <div className="section-publique-conteneur">
          <div className="section-publique-titre">Tout ce qu'il faut pour une classe de FLS</div>
          <p className="section-publique-sous-titre">
            Quatre modules pensés pour l'enseignement du français langue seconde, du partage
            de ressources jusqu'à la correction automatisée des travaux.
          </p>
          <div className="modules-grille">
            {MODULES.map((m) => (
              <div className="module-carte" key={m.title}>
                <div className="module-icone"><m.icon size={22} strokeWidth={1.75} /></div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-publique" style={{ background: 'var(--blanc)' }}>
        <div className="section-publique-conteneur">
          <div className="section-publique-titre">Comment ça marche</div>
          <p className="section-publique-sous-titre">Trois étapes, aucune installation.</p>
          <div className="etapes-grille">
            {ETAPES.map((e) => (
              <div className="etape" key={e.title}>
                <div className="etape-numero" />
                <h3>{e.title}</h3>
                <p>{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-publique">
        <div className="section-publique-conteneur">
          <div className="cta-bandeau">
            <h2>Prêt·e à commencer ?</h2>
            <p>Créez votre classe en moins de deux minutes — aucune carte de crédit requise.</p>
            <div className="cta-boutons">
              <Link href="/enseignant/inscription" className="btn-cta btn-cta-plein">
                <GraduationCap size={18} /> Créer une classe
              </Link>
              <Link href="/apprenant/inscription" className="btn-cta btn-cta-contour">
                <BookOpen size={18} /> Rejoindre une classe
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
