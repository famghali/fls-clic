-- ============================================================
-- Permet d'ajouter des activités H5P intégrées (par lien)
-- À exécuter une seule fois : Dashboard > SQL Editor > New query
-- ============================================================

alter table activities add column if not exists embed_url text;
