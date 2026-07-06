import './globals.css';

export const metadata = {
  title: "Le Carnet de route linguistique",
  description: "Enseignement du français langue seconde — documents, activités, grilles et devoirs corrigés par l'IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
