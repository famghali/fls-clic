import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StudentDashboard from '@/components/StudentDashboard';

export default async function ApprenantPage({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/apprenant/connexion');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'apprenant') redirect('/');

  const { data: memberships } = await supabase
    .from('class_members')
    .select('joined_at, classes(*)')
    .eq('student_id', user.id)
    .order('joined_at', { ascending: true });

  const classes = (memberships || []).map((m) => m.classes).filter(Boolean);

  if (classes.length === 0) {
    return (
      <div className="contenu-principal">
        <div className="etat-vide">
          <div className="grande-icone">📚</div>
          <p>Vous n'êtes inscrit·e à aucune classe pour l'instant.</p>
        </div>
      </div>
    );
  }

  const requested = searchParams?.classe;
  const classe = classes.find((c) => c.id === requested) || classes[0];

  const [{ data: announcements }, { data: assignments }, { data: resources }] = await Promise.all([
    supabase.from('announcements').select('*').eq('class_id', classe.id).order('created_at', { ascending: false }),
    supabase.from('assignments').select('*').eq('class_id', classe.id).order('created_at', { ascending: false }),
    supabase.from('resources').select('*').eq('class_id', classe.id).order('created_at', { ascending: false }),
  ]);

  const assignmentIds = (assignments || []).map((a) => a.id);
  let mySubmissions = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from('submissions')
      .select('id, assignment_id, content, file_url, file_name, status, submitted_at, corrections(*)')
      .eq('student_id', user.id)
      .in('assignment_id', assignmentIds);
    mySubmissions = data || [];
  }

  return (
    <StudentDashboard
      profile={profile}
      classe={classe}
      classes={classes}
      announcements={announcements || []}
      assignments={assignments || []}
      resources={resources || []}
      mySubmissions={mySubmissions}
    />
  );
}
