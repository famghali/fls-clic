-- ============================================================
-- Schéma de base de données — Carnet de route linguistique
-- À exécuter dans Supabase : Dashboard > SQL Editor > New query
-- ============================================================

-- Extension pour générer des identifiants uniques
create extension if not exists "uuid-ossp";

-- ---------- Profils utilisateurs (lié à l'authentification Supabase) ----------
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null check (role in ('enseignant', 'apprenant')),
  class_code text,
  created_at timestamptz default now()
);

-- ---------- Documents partagés ----------
create table documents (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null,
  content text,
  file_url text,
  class_code text,
  created_at timestamptz default now()
);

-- ---------- Activités interactives (quiz) ----------
create table activities (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null,
  class_code text,
  questions jsonb not null, -- [{q, options:[], correct}]
  created_at timestamptz default now()
);

create table activity_attempts (
  id uuid primary key default uuid_generate_v4(),
  activity_id uuid references activities(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  answers jsonb not null,
  score int,
  created_at timestamptz default now()
);

-- ---------- Devoirs et soumissions ----------
create table assignments (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null,
  instructions text not null,
  class_code text,
  rubric jsonb, -- grille associée (optionnelle), copiée depuis le générateur
  created_at timestamptz default now()
);

create table submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  answer_text text not null,
  status text default 'en_attente' check (status in ('en_attente', 'corrige', 'erreur')),
  correction jsonb, -- résultat structuré renvoyé par l'IA
  submitted_at timestamptz default now(),
  unique (assignment_id, student_id)
);

-- ============================================================
-- Sécurité au niveau des lignes (RLS) — indispensable en production
-- ============================================================
alter table profiles enable row level security;
alter table documents enable row level security;
alter table activities enable row level security;
alter table activity_attempts enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;

-- Tout utilisateur connecté peut lire les profils (pour afficher les noms)
create policy "Profils visibles par tous les connectés"
  on profiles for select using (auth.role() = 'authenticated');

create policy "Chacun modifie son propre profil"
  on profiles for update using (auth.uid() = id);

create policy "Création de son propre profil à l'inscription"
  on profiles for insert with check (auth.uid() = id);

-- Documents : lecture par tous les connectés, écriture par le propriétaire
create policy "Documents visibles par les connectés"
  on documents for select using (auth.role() = 'authenticated');
create policy "Créer ses propres documents"
  on documents for insert with check (auth.uid() = owner_id);
create policy "Modifier/supprimer ses propres documents"
  on documents for delete using (auth.uid() = owner_id);

-- Activités : même logique
create policy "Activités visibles par les connectés"
  on activities for select using (auth.role() = 'authenticated');
create policy "Créer ses propres activités"
  on activities for insert with check (auth.uid() = owner_id);
create policy "Supprimer ses propres activités"
  on activities for delete using (auth.uid() = owner_id);

create policy "Tentatives visibles par les connectés"
  on activity_attempts for select using (auth.role() = 'authenticated');
create policy "Soumettre sa propre tentative"
  on activity_attempts for insert with check (auth.uid() = student_id);

-- Devoirs
create policy "Devoirs visibles par les connectés"
  on assignments for select using (auth.role() = 'authenticated');
create policy "Créer ses propres devoirs"
  on assignments for insert with check (auth.uid() = owner_id);
create policy "Supprimer ses propres devoirs"
  on assignments for delete using (auth.uid() = owner_id);

-- Soumissions : l'apprenant voit/crée les siennes, l'enseignant voit celles de ses devoirs
create policy "Voir ses propres soumissions"
  on submissions for select using (
    auth.uid() = student_id
    or auth.uid() in (select owner_id from assignments where assignments.id = submissions.assignment_id)
  );
create policy "Soumettre sa propre réponse"
  on submissions for insert with check (auth.uid() = student_id);
create policy "Mettre à jour sa propre soumission (ex. re-correction)"
  on submissions for update using (auth.uid() = student_id);
