-- ═══════════════════════════════════════════════════════════════
-- Le Carnet de route linguistique — schéma Supabase
-- Copiez tout ce fichier dans SQL Editor > New query, puis Run.
--
-- Toutes les tables vivent dans le schéma "carnet" (et non "public")
-- pour coexister sans collision avec d'autres projets déjà présents
-- dans la même base de données Supabase.
--
-- ⚠️ Étape supplémentaire obligatoire après avoir exécuté ce script :
-- Dashboard > Project Settings > Data API > Exposed schemas
-- → ajoutez "carnet" à la liste (à côté de "public"), puis Save.
-- Sans cette étape, l'application ne pourra pas accéder aux tables.
-- ═══════════════════════════════════════════════════════════════

create schema if not exists carnet;

grant usage on schema carnet to authenticated, anon;
alter default privileges in schema carnet grant all on tables to authenticated, anon;
alter default privileges in schema carnet grant all on sequences to authenticated, anon;
alter default privileges in schema carnet grant execute on functions to authenticated, anon;

-- ─── PROFILS ───
-- Complète auth.users avec un nom affiché et un rôle.
create table carnet.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('enseignant', 'apprenant')),
  created_at timestamptz not null default now()
);

grant all on carnet.profiles to authenticated, anon;
alter table carnet.profiles enable row level security;

create policy "Profils visibles par tous les utilisateurs connectés"
  on carnet.profiles for select
  to authenticated
  using (true);

create policy "Un utilisateur modifie son propre profil"
  on carnet.profiles for update
  to authenticated
  using (id = auth.uid());

-- Crée automatiquement un profil à l'inscription, à partir des métadonnées
-- passées lors du signUp (full_name, role).
create function carnet.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = carnet
as $$
begin
  insert into carnet.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Sans nom'),
    coalesce(new.raw_user_meta_data->>'role', 'apprenant')
  );
  return new;
end;
$$;

create trigger on_auth_user_created_carnet
  after insert on auth.users
  for each row execute function carnet.handle_new_user();

-- ─── CLASSES ───
create table carnet.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references carnet.profiles(id) on delete cascade,
  name text not null,
  level text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

grant all on carnet.classes to authenticated, anon;
alter table carnet.classes enable row level security;

-- ─── MEMBRES DE CLASSE ───
-- (créée avant les fonctions utilitaires ci-dessous, qui la référencent)
create table carnet.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references carnet.classes(id) on delete cascade,
  student_id uuid not null references carnet.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (class_id, student_id)
);

grant all on carnet.class_members to authenticated, anon;
alter table carnet.class_members enable row level security;

create function carnet.is_class_teacher(p_class_id uuid)
returns boolean
language sql
security definer set search_path = carnet
stable
as $$
  select exists (
    select 1 from carnet.classes
    where id = p_class_id and teacher_id = auth.uid()
  );
$$;

create function carnet.is_class_member(p_class_id uuid)
returns boolean
language sql
security definer set search_path = carnet
stable
as $$
  select exists (
    select 1 from carnet.class_members
    where class_id = p_class_id and student_id = auth.uid()
  );
$$;

create policy "L'enseignant gère ses classes"
  on carnet.classes for all
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Les apprenants voient les classes rejointes"
  on carnet.classes for select
  to authenticated
  using (carnet.is_class_member(id));

create policy "L'enseignant voit les membres de ses classes"
  on carnet.class_members for select
  to authenticated
  using (carnet.is_class_teacher(class_id));

create policy "Un apprenant voit sa propre inscription"
  on carnet.class_members for select
  to authenticated
  using (student_id = auth.uid());

-- Rejoindre une classe par code (fonction sécurisée : l'apprenant n'a pas
-- besoin d'un accès direct en lecture à la table classes pour vérifier le code).
create function carnet.join_class_by_code(p_code text)
returns carnet.classes
language plpgsql
security definer set search_path = carnet
as $$
declare
  v_class carnet.classes;
begin
  select * into v_class from carnet.classes where code = upper(p_code);

  if v_class.id is null then
    raise exception 'Code de classe invalide.';
  end if;

  insert into carnet.class_members (class_id, student_id)
  values (v_class.id, auth.uid())
  on conflict (class_id, student_id) do nothing;

  return v_class;
end;
$$;

grant execute on function carnet.join_class_by_code(text) to authenticated;

-- ─── ANNONCES ───
create table carnet.announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references carnet.classes(id) on delete cascade,
  author_id uuid not null references carnet.profiles(id),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

grant all on carnet.announcements to authenticated, anon;
alter table carnet.announcements enable row level security;

create policy "Membres et enseignant lisent les annonces"
  on carnet.announcements for select
  to authenticated
  using (carnet.is_class_teacher(class_id) or carnet.is_class_member(class_id));

create policy "L'enseignant publie des annonces"
  on carnet.announcements for insert
  to authenticated
  with check (carnet.is_class_teacher(class_id) and author_id = auth.uid());

create policy "L'enseignant supprime ses annonces"
  on carnet.announcements for delete
  to authenticated
  using (carnet.is_class_teacher(class_id));

-- ─── RESSOURCES (documents) ───
create table carnet.resources (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references carnet.classes(id) on delete cascade,
  author_id uuid not null references carnet.profiles(id),
  title text not null,
  url text not null,
  description text,
  category text not null default 'Site',
  created_at timestamptz not null default now()
);

grant all on carnet.resources to authenticated, anon;
alter table carnet.resources enable row level security;

create policy "Membres et enseignant lisent les ressources"
  on carnet.resources for select
  to authenticated
  using (carnet.is_class_teacher(class_id) or carnet.is_class_member(class_id));

create policy "L'enseignant ajoute des ressources"
  on carnet.resources for insert
  to authenticated
  with check (carnet.is_class_teacher(class_id) and author_id = auth.uid());

create policy "L'enseignant supprime ses ressources"
  on carnet.resources for delete
  to authenticated
  using (carnet.is_class_teacher(class_id));

-- ─── DEVOIRS (activités / assignments) ───
create table carnet.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references carnet.classes(id) on delete cascade,
  author_id uuid not null references carnet.profiles(id),
  title text not null,
  instructions text not null,
  assignment_type text not null default 'Rédaction',
  due_date date,
  nclc_level text,
  -- Pièce jointe de support (lien externe OU fichier téléversé — Word/PDF/YouTube/Autre)
  attachment_type text check (attachment_type in ('Word', 'PDF', 'YouTube', 'Autre')),
  attachment_url text,
  attachment_title text,
  -- Questions/critères d'évaluation définis par l'enseignant·e, utilisés par l'IA
  evaluation_questions jsonb not null default '[]',
  created_at timestamptz not null default now()
);

grant all on carnet.assignments to authenticated, anon;
alter table carnet.assignments enable row level security;

create policy "Membres et enseignant lisent les devoirs"
  on carnet.assignments for select
  to authenticated
  using (carnet.is_class_teacher(class_id) or carnet.is_class_member(class_id));

create policy "L'enseignant crée des devoirs"
  on carnet.assignments for insert
  to authenticated
  with check (carnet.is_class_teacher(class_id) and author_id = auth.uid());

create policy "L'enseignant supprime ses devoirs"
  on carnet.assignments for delete
  to authenticated
  using (carnet.is_class_teacher(class_id));

-- ─── REMISES (soumissions des apprenants) ───
create table carnet.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references carnet.assignments(id) on delete cascade,
  student_id uuid not null references carnet.profiles(id) on delete cascade,
  content text,
  -- Fichier PDF téléversé (alternative au texte collé) — voir bucket 'carnet-devoirs' plus bas
  file_url text,
  file_name text,
  status text not null default 'remis' check (status in ('remis', 'corrige')),
  submitted_at timestamptz not null default now(),
  unique (assignment_id, student_id),
  constraint remise_contenu_ou_fichier check (content is not null or file_url is not null)
);

grant all on carnet.submissions to authenticated, anon;
alter table carnet.submissions enable row level security;

create policy "L'apprenant gère sa propre remise"
  on carnet.submissions for all
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "L'enseignant lit les remises de ses devoirs"
  on carnet.submissions for select
  to authenticated
  using (
    exists (
      select 1 from carnet.assignments a
      where a.id = assignment_id and carnet.is_class_teacher(a.class_id)
    )
  );

-- ─── CORRECTIONS IA ───
create table carnet.corrections (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references carnet.submissions(id) on delete cascade,
  annotated_text text not null,
  errors jsonb not null default '[]',
  criteria jsonb not null default '[]',
  score integer,
  feedback_strengths text,
  feedback_improve text,
  created_at timestamptz not null default now()
);

grant all on carnet.corrections to authenticated, anon;
alter table carnet.corrections enable row level security;

create policy "L'apprenant lit la correction de sa remise"
  on carnet.corrections for select
  to authenticated
  using (
    exists (
      select 1 from carnet.submissions s
      where s.id = submission_id and s.student_id = auth.uid()
    )
  );

create policy "L'enseignant lit les corrections de ses devoirs"
  on carnet.corrections for select
  to authenticated
  using (
    exists (
      select 1 from carnet.submissions s
      join carnet.assignments a on a.id = s.assignment_id
      where s.id = submission_id and carnet.is_class_teacher(a.class_id)
    )
  );

create policy "L'apprenant enregistre la correction de sa propre remise"
  on carnet.corrections for insert
  to authenticated
  with check (
    exists (
      select 1 from carnet.submissions s
      where s.id = submission_id and s.student_id = auth.uid()
    )
  );

-- ─── STOCKAGE (Supabase Storage) — fichiers de devoirs et de remises ───
-- Bucket dédié 'carnet-devoirs' (nom distinct de tout autre bucket existant).
-- Bucket public : les liens générés sont accessibles à quiconque les possède
-- (comme un lien Google Docs), mais seuls l'enseignant·e de la classe et
-- l'apprenant·e concerné·e peuvent y déposer des fichiers.
insert into storage.buckets (id, name, public)
values ('carnet-devoirs', 'carnet-devoirs', true)
on conflict (id) do nothing;

-- Ces règles vivent sur storage.objects, une table partagée par tout le
-- projet (pas dans le schéma "carnet") — on les supprime d'abord si elles
-- existent déjà pour que ce script reste rejouable sans erreur.
drop policy if exists "Carnet — l'enseignant dépose des pièces jointes pour ses classes" on storage.objects;
drop policy if exists "Carnet — l'enseignant supprime ses pièces jointes" on storage.objects;
drop policy if exists "Carnet — l'apprenant dépose sa propre remise" on storage.objects;
drop policy if exists "Carnet — l'apprenant remplace sa propre remise" on storage.objects;

-- Chemin des pièces jointes de devoir : pieces-jointes/{class_id}/{fichier}
create policy "Carnet — l'enseignant dépose des pièces jointes pour ses classes"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'carnet-devoirs'
    and (storage.foldername(name))[1] = 'pieces-jointes'
    and carnet.is_class_teacher(((storage.foldername(name))[2])::uuid)
  );

create policy "Carnet — l'enseignant supprime ses pièces jointes"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'carnet-devoirs'
    and (storage.foldername(name))[1] = 'pieces-jointes'
    and carnet.is_class_teacher(((storage.foldername(name))[2])::uuid)
  );

-- Chemin des remises : remises/{assignment_id}/{student_id}/{fichier}
create policy "Carnet — l'apprenant dépose sa propre remise"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'carnet-devoirs'
    and (storage.foldername(name))[1] = 'remises'
    and (storage.foldername(name))[3] = auth.uid()::text
  );

create policy "Carnet — l'apprenant remplace sa propre remise"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'carnet-devoirs'
    and (storage.foldername(name))[1] = 'remises'
    and (storage.foldername(name))[3] = auth.uid()::text
  );
