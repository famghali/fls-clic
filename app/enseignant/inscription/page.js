'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signUpTeacher } from '@/app/actions';

function BoutonSoumettre() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-principal" type="submit" disabled={pending}>
      {pending ? 'Création…' : 'Créer ma classe →'}
    </button>
  );
}

export default function InscriptionEnseignant() {
  const [state, formAction] = useFormState(signUpTeacher, null);

  return (
    <div className="ecran-form">
      <div className="form-carte">
        <h2>Créer une classe</h2>
        <p className="sous-titre">Créez votre compte enseignant·e et partagez le code avec vos apprenants</p>
        {state?.error && <div className="erreur-form">{state.error}</div>}
        <form action={formAction}>
          <div className="champ">
            <label>Votre prénom et nom</label>
            <input type="text" name="fullName" placeholder="ex. Marie Tremblay" required />
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
            <label>Nom de la classe</label>
            <input type="text" name="className" placeholder="ex. FLS intermédiaire — automne 2025" required />
          </div>
          <div className="champ">
            <label>Niveau</label>
            <select name="level" required defaultValue="">
              <option value="" disabled>Choisir un niveau</option>
              <option>Débutant (A1–A2)</option>
              <option>Intermédiaire (B1–B2)</option>
              <option>Avancé (C1–C2)</option>
              <option>Mixte</option>
            </select>
          </div>
          <BoutonSoumettre />
        </form>
        <p className="sous-titre" style={{ marginTop: '1rem', marginBottom: 0 }}>
          Déjà un compte ? <Link href="/enseignant/connexion" style={{ color: 'var(--ciel)' }}>Connectez-vous</Link>
        </p>
      </div>
      <Link href="/" className="lien-retour">← Retour</Link>
    </div>
  );
}
