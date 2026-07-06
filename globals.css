import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TeacherDashboard from '@/components/TeacherDashboard';

export default async function EnseignantPage({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/enseignant/connexion');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'enseignant') redirect('/');

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: true });

  if (!classes || classes.length === 0) {
    return (
      <div className="contenu-principal">
        <div className="etat-vide">
          <div className="grande-icone">🏫</div>
          <p>Aucune classe associée à votre compte. Contactez le support.</p>
        </div>
      </div>
    );
  }

  const requested = searchParams?.classe;
  const classe = classes.find((c) => c.id === requested) || classes[0];

  const [{ data: announcements }, { data: assignments }, { data: members }, { data: resources }] = await Promise.all([
    supabase.from('announcements').select('*').eq('class_id', classe.id).order('created_at', { ascending: false }),
    supabase.from('assignments').select('*').eq('class_id', classe.id).order('created_at', { ascending: false }),
    supabase.from('class_members').select('student_id, joined_at, profiles(full_name)').eq('class_id', classe.id),
    supabase.from('resources').select('*').eq('class_id', classe.id).order('created_at', { ascending: false }),
  ]);

  const assignmentIds = (assignments || []).map((a) => a.id);
  let submissions = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from('submissions')
      .select('id, assignment_id, student_id, content, file_url, file_name, status, submitted_at, profiles(full_name), corrections(*)')
      .in('assignment_id', assignmentIds);
    submissions = data || [];
  }

  return (
    <TeacherDashboard
      profile={profile}
      classe={classe}
      classes={classes}
      announcements={announcements || []}
      assignments={assignments || []}
      members={members || []}
      resources={resources || []}
      submissions={submissions}
    />
  );
}
