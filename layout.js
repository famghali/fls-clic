'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { runAICorrection } from '@/lib/correction';

function readError(error, fallback) {
  return error?.message || fallback;
}

export async function signUpTeacher(prevState, formData) {
  const fullName = formData.get('fullName')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  const className = formData.get('className')?.toString().trim();
  const level = formData.get('level')?.toString();

  if (!fullName || !email || !password || !className || !level) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  const supabase = createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role: 'enseignant' } },
  });

  if (signUpError) return { error: readError(signUpError, "Impossible de créer le compte.") };
  if (!signUpData.session) {
    return { error: "Compte créé ! Vérifiez votre courriel pour confirmer, puis connectez-vous." };
  }

  const code = 'FLS-' + Math.floor(1000 + Math.random() * 9000);
  const { error: classError } = await supabase.from('classes').insert({
    teacher_id: signUpData.user.id,
    name: className,
    level,
    code,
  });

  if (classError) return { error: readError(classError, "Impossible de créer la classe.") };

  redirect('/enseignant');
}

export async function signInTeacher(prevState, formData) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  if (!email || !password) return { error: 'Veuillez remplir tous les champs.' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: readError(error, 'Connexion impossible.') };

  redirect('/enseignant');
}

export async function signUpStudent(prevState, formData) {
  const fullName = formData.get('fullName')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  const code = formData.get('code')?.toString().trim();

  if (!fullName || !email || !password || !code) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  const supabase = createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role: 'apprenant' } },
  });

  if (signUpError) return { error: readError(signUpError, "Impossible de créer le compte.") };
  if (!signUpData.session) {
    return { error: "Compte créé ! Vérifiez votre courriel pour confirmer, puis connectez-vous." };
  }

  const { error: joinError } = await supabase.rpc('join_class_by_code', { p_code: code });
  if (joinError) return { error: "Compte créé, mais le code de classe est invalide. Demandez le bon code à votre enseignant·e." };

  redirect('/apprenant');
}

export async function signInStudent(prevState, formData) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  if (!email || !password) return { error: 'Veuillez remplir tous les champs.' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: readError(error, 'Connexion impossible.') };

  redirect('/apprenant');
}

export async function joinAnotherClass(formData) {
  const code = formData.get('code')?.toString().trim();
  if (!code) return { error: 'Entrez un code de classe.' };

  const supabase = createClient();
  const { error } = await supabase.rpc('join_class_by_code', { p_code: code });
  if (error) return { error: 'Code de classe invalide.' };

  revalidatePath('/apprenant');
  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function createClass(formData) {
  const name = formData.get('name')?.toString().trim();
  const level = formData.get('level')?.toString();
  if (!name || !level) return { error: 'Nom et niveau requis.' };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const code = 'FLS-' + Math.floor(1000 + Math.random() * 9000);
  const { data: classe, error } = await supabase
    .from('classes')
    .insert({ teacher_id: user.id, name, level, code })
    .select()
    .single();

  if (error) return { error: readError(error, 'Impossible de créer la classe.') };
  revalidatePath('/enseignant');
  return { success: true, classe };
}

export async function postAnnouncement(classId, formData) {
  const title = formData.get('title')?.toString().trim();
  const body = formData.get('body')?.toString().trim();
  if (!title || !body) return { error: 'Titre et message requis.' };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('announcements').insert({
    class_id: classId,
    author_id: user.id,
    title,
    body,
  });

  if (error) return { error: readError(error, "Impossible de publier l'annonce.") };
  revalidatePath('/enseignant');
  revalidatePath('/apprenant');
  return { success: true };
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function guessAttachmentType(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc' || ext === 'docx') return 'Word';
  return 'Autre';
}

export async function createAssignment(classId, formData) {
  const title = formData.get('title')?.toString().trim();
  const instructions = formData.get('instructions')?.toString().trim();
  const assignmentType = formData.get('assignmentType')?.toString() || 'Rédaction';
  const dueDate = formData.get('dueDate')?.toString() || null;
  const nclcLevel = formData.get('nclcLevel')?.toString().trim() || null;
  const attachmentMode = formData.get('attachmentMode')?.toString() || 'aucune';
  const attachmentTitle = formData.get('attachmentTitle')?.toString().trim() || null;
  const evaluationQuestionsRaw = formData.get('evaluationQuestions')?.toString() || '';
  const evaluationQuestions = evaluationQuestionsRaw
    .split('\n')
    .map((q) => q.trim())
    .filter(Boolean);

  if (!title || !instructions) return { error: 'Titre et consigne requis.' };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let attachmentType = null;
  let attachmentUrl = null;

  if (attachmentMode === 'lien') {
    attachmentType = formData.get('attachmentType')?.toString() || null;
    attachmentUrl = formData.get('attachmentUrl')?.toString().trim() || null;
    if (!attachmentUrl) return { error: 'Ajoutez un lien pour la pièce jointe.' };
  } else if (attachmentMode === 'fichier') {
    const file = formData.get('attachmentFile');
    if (!(file instanceof File) || file.size === 0) return { error: 'Choisissez un fichier à téléverser.' };
    attachmentType = guessAttachmentType(file.name);
    const path = `pieces-jointes/${classId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from('carnet-devoirs').upload(path, file, { contentType: file.type });
    if (uploadError) return { error: 'Échec du téléversement : ' + uploadError.message };
    attachmentUrl = supabase.storage.from('carnet-devoirs').getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from('assignments').insert({
    class_id: classId,
    author_id: user.id,
    title,
    instructions,
    assignment_type: assignmentType,
    due_date: dueDate,
    nclc_level: nclcLevel,
    attachment_type: attachmentType,
    attachment_url: attachmentUrl,
    attachment_title: attachmentTitle,
    evaluation_questions: evaluationQuestions,
  });

  if (error) return { error: readError(error, 'Impossible de créer le devoir.') };
  revalidatePath('/enseignant');
  revalidatePath('/apprenant');
  return { success: true };
}

export async function deleteAssignment(assignmentId) {
  const supabase = createClient();
  const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
  if (error) return { error: readError(error, 'Suppression impossible.') };
  revalidatePath('/enseignant');
  revalidatePath('/apprenant');
  return { success: true };
}

export async function addResource(classId, formData) {
  const title = formData.get('title')?.toString().trim();
  const url = formData.get('url')?.toString().trim();
  const description = formData.get('description')?.toString().trim() || null;
  const category = formData.get('category')?.toString() || 'Site';

  if (!title || !url) return { error: 'Titre et URL requis.' };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('resources').insert({
    class_id: classId,
    author_id: user.id,
    title,
    url,
    description,
    category,
  });

  if (error) return { error: readError(error, "Impossible d'ajouter la ressource.") };
  revalidatePath('/enseignant');
  revalidatePath('/apprenant');
  return { success: true };
}

export async function deleteResource(resourceId) {
  const supabase = createClient();
  const { error } = await supabase.from('resources').delete().eq('id', resourceId);
  if (error) return { error: readError(error, 'Suppression impossible.') };
  revalidatePath('/enseignant');
  revalidatePath('/apprenant');
  return { success: true };
}

export async function submitAssignment(assignmentId, formData) {
  const content = formData.get('content')?.toString().trim() || null;
  const file = formData.get('file');
  const hasFile = file instanceof File && file.size > 0;

  if (!content && !hasFile) return { error: 'Écrivez votre texte ou joignez un fichier PDF avant de remettre.' };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let fileUrl = null;
  let fileName = null;

  if (hasFile) {
    if (file.type !== 'application/pdf') return { error: 'Seuls les fichiers PDF sont acceptés pour une remise.' };
    const path = `remises/${assignmentId}/${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from('carnet-devoirs').upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) return { error: 'Échec du téléversement : ' + uploadError.message };
    fileUrl = supabase.storage.from('carnet-devoirs').getPublicUrl(path).data.publicUrl;
    fileName = file.name;
  }

  const { data: submission, error } = await supabase
    .from('submissions')
    .upsert(
      { assignment_id: assignmentId, student_id: user.id, content, file_url: fileUrl, file_name: fileName, status: 'remis' },
      { onConflict: 'assignment_id,student_id' }
    )
    .select()
    .single();

  if (error) return { error: readError(error, 'Impossible de remettre le travail.') };

  try {
    await runAICorrection(supabase, submission);
  } catch (e) {
    console.error('Correction IA échouée:', e);
  }

  revalidatePath('/apprenant');
  revalidatePath('/enseignant');
  return { success: true };
}
