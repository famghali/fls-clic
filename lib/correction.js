import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const CORRECTION_SCHEMA = {
  type: 'object',
  properties: {
    annotated_text: {
      type: 'string',
      description:
        "Le texte de l'apprenant reproduit intégralement, avec chaque erreur entourée de crochets suivis de la correction entre parenthèses, ex. : « Je [suis allé au](suis allée au) magasin. »",
    },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          original: { type: 'string' },
          correction: { type: 'string' },
          category: { type: 'string', enum: ['orthographe', 'grammaire', 'style_ponctuation'] },
          explanation: { type: 'string' },
        },
        required: ['original', 'correction', 'category', 'explanation'],
        additionalProperties: false,
      },
    },
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          met: { type: 'boolean' },
          comment: { type: 'string' },
        },
        required: ['label', 'met', 'comment'],
        additionalProperties: false,
      },
    },
    score: { type: 'integer' },
    feedback_strengths: { type: 'string' },
    feedback_improve: { type: 'string' },
  },
  required: ['annotated_text', 'errors', 'criteria', 'score', 'feedback_strengths', 'feedback_improve'],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `Tu es un·e enseignant·e expérimenté·e en français langue seconde (FLS), utilisant l'échelle des Niveaux de compétence linguistique canadiens (NCLC). On te donne la consigne d'un devoir et le texte remis par un·e apprenant·e. Corrige le texte avec bienveillance et précision :
- Relève les erreurs d'orthographe, de grammaire et de style/ponctuation.
- Si une liste de « questions/critères d'évaluation » définis par l'enseignant·e est fournie, évalue le texte contre CHACUNE de ces questions exactement (un élément de "criteria" par question, dans le même ordre, avec le texte de la question comme "label"). Sinon, évalue 3 à 5 critères pertinents que tu identifies toi-même à partir de la consigne (ex. respect du sujet, longueur, temps de verbe demandé, clarté).
- Donne un score global sur 100 reflétant la qualité du texte par rapport au niveau demandé.
- Rédige une rétroaction constructive : ce qui est réussi, puis ce qu'il faut travailler.
Réponds uniquement avec l'objet JSON demandé, sans texte autour.`;

export async function runAICorrection(supabase, submission) {
  const { data: assignment } = await supabase
    .from('assignments')
    .select('title, instructions, assignment_type, nclc_level, evaluation_questions')
    .eq('id', submission.assignment_id)
    .single();

  if (!assignment) return;

  const questions = Array.isArray(assignment.evaluation_questions) ? assignment.evaluation_questions : [];
  const questionsBlock = questions.length > 0
    ? `\n\nQuestions/critères d'évaluation définis par l'enseignant·e (évalue chacune, dans l'ordre) :\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const instructionsText = `Consigne du devoir : "${assignment.title}" (${assignment.assignment_type}${assignment.nclc_level ? `, NCLC ${assignment.nclc_level}` : ''})
${assignment.instructions}${questionsBlock}`;

  let userContent;

  if (submission.file_url) {
    const pdfResponse = await fetch(submission.file_url);
    if (!pdfResponse.ok) throw new Error('Impossible de récupérer le fichier PDF remis.');
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    userContent = [
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: pdfBuffer.toString('base64') },
      },
      {
        type: 'text',
        text: `${instructionsText}\n\nLe travail de l'apprenant·e est le document PDF ci-joint. Reproduis fidèlement son contenu textuel dans "annotated_text" en y annotant les erreurs.`,
      },
    ];
  } else {
    userContent = `${instructionsText}\n\nTexte remis par l'apprenant·e :\n"""\n${submission.content}\n"""`;
  }

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: CORRECTION_SCHEMA } },
    messages: [{ role: 'user', content: userContent }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('Aucune réponse texte de Claude.');

  const result = JSON.parse(textBlock.text);

  await supabase.from('corrections').insert({
    submission_id: submission.id,
    annotated_text: result.annotated_text,
    errors: result.errors,
    criteria: result.criteria,
    score: result.score,
    feedback_strengths: result.feedback_strengths,
    feedback_improve: result.feedback_improve,
  });

  await supabase.from('submissions').update({ status: 'corrige' }).eq('id', submission.id);
}
