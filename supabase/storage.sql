-- ============================================================
-- Stockage de fichiers pour l'onglet Documents
-- À exécuter une seule fois, après schema.sql : Dashboard > SQL Editor > New query
-- ============================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "Utilisateurs connectés peuvent déposer des fichiers"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Fichiers du bucket documents visibles par tous"
  on storage.objects for select
  using (bucket_id = 'documents');

create policy "Supprimer ses propres fichiers"
  on storage.objects for delete
  using (bucket_id = 'documents' and owner = auth.uid());
