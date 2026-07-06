'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signInStudent } from '@/app/actions';

function BoutonSoumettre() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-principal" type="submit" disabled={pending}>
      {pending ? 'Connexion…' : 'Me connecter →'}
    </button>
  );
}

export default function ConnexionApprenant() {
  const [state, formAction] = useFormState(signInStudent, null);

  return (
    <div className="ecran-form">
      <div className="form-carte">
        <h2>Connexion apprenant·e</h2>
        <p className="sous-titre">Accédez à vos devoirs et ressources</p>
        {state?.error && <div className="erreur-form">{state.error}</div>}
        <form action={formAction}>
          <div className="champ">
            <label>Courriel</label>
            <input type="email" name="email" placeholder="vous@exemple.com" required />
          </div>
          <div className="champ">
            <label>Mot de passe</label>
            <input type="password" name="password" required />
          </div>
          <BoutonSoumettre />
        </form>
        <p className="sous-titre" style={{ marginTop: '1rem', marginBottom: 0 }}>
          Pas encore de compte ? <Link href="/apprenant/inscription" style={{ color: 'var(--ciel)' }}>Rejoindre une classe</Link>
        </p>
      </div>
      <Link href="/" className="lien-retour">← Retour</Link>
    </div>
  );
}
