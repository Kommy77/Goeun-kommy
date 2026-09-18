import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUser } from './_lib/requireUser';

const MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

interface IngredientInput {
  name: string;
  status: '여유' | '임박' | '오늘' | '초과';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUser(req, res);
  if (!userId) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GEMINI_API_KEY' });
    return;
  }

  const { ingredients } = req.body ?? {};
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    res.status(400).json({ error: 'ingredients array is required' });
    return;
  }

  const ingredientList = (ingredients as IngredientInput[])
    .map((ing) => `${ing.name}(상태: ${ing.status})`)
    .join(', ');

  const systemPrompt = `너는 냉장고 재료를 보고 레시피를 추천하는 요리 어시스턴트야.
사용자가 보유한 재료 목록을 참고해서, 실제로 만들 수 있는 한식/양식 레시피 4~5개를 추천해.
상태가 "임박" 또는 "오늘"인 재료를 사용하는 레시피를 우선순위로 앞쪽에 배치해.
JSON 배열만 응답해.
각 레시피는 다음 형식이어야 해:
{
  "title": "레시피 이름",
  "cookTime": "15분",
  "servings": 2,
  "matchRate": 80,
  "requiredIngredients": ["재료1", "재료2"],
  "missingIngredients": ["보유하지 않은 재료"],
  "steps": ["1단계 설명", "2단계 설명"]
}
matchRate는 requiredIngredients 중 사용자가 실제로 보유한 재료 비율을 0~100 정수로 계산해.`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: `보유 재료: ${ingredientList}` }] }],
        generationConfig: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: `Gemini API error: ${errText}` });
      return;
    }

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';

    let recipes = [];
    try {
      recipes = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      recipes = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }

    res.status(200).json({ recipes });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
