'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signUpStudent } from '@/app/actions';

function BoutonSoumettre() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-principal" type="submit" disabled={pending}>
      {pending ? 'Inscription…' : 'Rejoindre →'}
    </button>
  );
}

export default function InscriptionApprenant() {
  const [state, formAction] = useFormState(signUpStudent, null);

  return (
    <div className="ecran-form">
      <div className="form-carte">
        <h2>Rejoindre une classe</h2>
        <p className="sous-titre">Créez votre compte et entrez le code donné par votre enseignant·e</p>
        {state?.error && <div className="erreur-form">{state.error}</div>}
        <form action={formAction}>
          <div className="champ">
            <label>Votre prénom et nom</label>
            <input type="text" name="fullName" placeholder="ex. João Silva" required />
          </div>
          <div className="champ">
            <label>Courriel</label>
            <input type="email" name="email" placeholder="vous@exemple.com" required />
          </div>
          <div className="champ">
            <label>Mot de passe</label>
            <input type="password" name="password" placeholder="6 caractères minimum" minLength={6} required />
          </div>
          <div className="champ">
            <label>Code de classe</label>
            <input
              type="text"
              name="code"
              placeholder="ex. FLS-4872"
              style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}
              required
            />
          </div>
          <BoutonSoumettre />
        </form>
        <p className="sous-titre" style={{ marginTop: '1rem', marginBottom: 0 }}>
          Déjà un compte ? <Link href="/apprenant/connexion" style={{ color: 'var(--ciel)' }}>Connectez-vous</Link>
        </p>
      </div>
      <Link href="/" className="lien-retour">← Retour</Link>
    </div>
  );
}
