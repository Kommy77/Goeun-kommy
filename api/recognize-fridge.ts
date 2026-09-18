import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUser } from './_lib/requireUser';

const MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

interface RecognizedItem {
  name: string;
  storage: '냉장' | '냉동';
  shelfLifeDays: number;
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

  const { imageBase64, mediaType } = req.body ?? {};
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    res.status(400).json({ error: 'imageBase64 is required' });
    return;
  }

  const systemPrompt = `너는 냉장고 사진을 보고 식재료를 인식하는 어시스턴트야.
사진에 보이는 개별 식재료를 최대한 정확히 식별해.
각 식재료마다 이름(한국어, 예: "우유", "계란", "양파"), 일반적인 보관 방식("냉장" 또는 "냉동"), 구매 후 평균 소비기한(일 단위 정수)을 추정해.
JSON 배열만 응답해.
형식: [{"name": "우유", "storage": "냉장", "shelfLifeDays": 7}]
식재료를 하나도 못 찾으면 빈 배열 []을 반환해.`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mediaType || 'image/jpeg', data: imageBase64 } },
              { text: '이 냉장고/식재료 사진에서 보이는 식재료를 모두 JSON 배열로 알려줘.' },
            ],
          },
        ],
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

    let parsed: RecognizedItem[] = [];
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }

    const items = parsed
      .filter((item) => item && typeof item.name === 'string')
      .map((item) => ({
        name: item.name,
        storage: item.storage === '냉동' ? '냉동' : '냉장',
        shelfLifeDays: Number.isFinite(item.shelfLifeDays) ? item.shelfLifeDays : 7,
      }));

    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
