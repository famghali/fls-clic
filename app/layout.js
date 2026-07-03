export const metadata = {
  title: "Le Carnet de route linguistique FLS/CLIC",
  description: "Plateforme pour enseignants et apprenants — documents, activités, grilles NCLC et correction IA.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
