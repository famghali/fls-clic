import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { assignmentTitle, instructions, rubricText, answerText } = await req.json();

    const prompt = `Tu es un·e enseignant·e de français langue seconde qui corrige un devoir.

Consigne du devoir : "${assignmentTitle}"
Instructions données à l'apprenant·e : ${instructions}

Grille de correction à utiliser :
${rubricText || "Aucune grille spécifique fournie — évalue selon les standards habituels du niveau indiqué."}

Réponse de l'apprenant·e :
"""
${answerText}
"""

Corrige cette réponse. Réponds UNIQUEMENT avec un objet JSON valide (sans texte autour, sans balises markdown) de cette forme :
{
  "note": "note sur 20, ex: 14/20",
  "points_forts": ["point fort 1", "point fort 2"],
  "points_a_ameliorer": ["point 1", "point 2"],
  "commentaire_general": "2-3 phrases de rétroaction bienveillante et constructive",
  "erreurs_relevees": [{"extrait": "court extrait avec l'erreur", "correction": "correction proposée", "explication": "brève explication"}]
}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Erreur API Anthropic : " + errText }, { status: 500 });
    }

    const data = await res.json();
    const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("\n");
    const cleaned = text.replace(/```json|```/g, "").trim();
    const correction = JSON.parse(cleaned);

    return NextResponse.json({ correction });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
