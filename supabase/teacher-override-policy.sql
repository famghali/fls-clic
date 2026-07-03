-- ============================================================
-- Autorise l'enseignant à modifier manuellement la correction IA
-- de ses propres devoirs (note et commentaire).
-- À exécuter une seule fois : Dashboard > SQL Editor > New query
-- ============================================================

create policy "Enseignant peut modifier la correction de ses devoirs"
  on submissions for update
  using (auth.uid() in (select owner_id from assignments where assignments.id = submissions.assignment_id));
