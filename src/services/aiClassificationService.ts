import { GoogleGenAI } from '@google/genai';

// Initialize the SDK with the Vite env variable
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface ClassificationResult {
  souvenir_item: string;
  recommended_category_id: number | null;
  extracted_keyword: string | null;
}

export async function autoClassifyWithAI(
  unclassifiedItems: string[],
  categories: { id: number; name: string }[]
): Promise<ClassificationResult[]> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('請先在 .env 中設定 VITE_GEMINI_API_KEY');
  }

  if (unclassifiedItems.length === 0 || categories.length === 0) {
    return [];
  }

  const systemInstruction = `
你是一個智能商品分類助手。
你的任務是將提供的「未分類紀念品名單」分配到提供的「已知分類列表」中，
並且從雜亂的商品名稱中，萃取出最核心的代表名詞（2~4個字）作為分類關鍵字。

【規則】
1. 只能從「已知分類列表」中選擇最適合的分類 ID (recommended_category_id)。
2. 萃取的關鍵字 (extracted_keyword) 必須是核心商品名詞，例如「妙管家八倍濃縮洗衣球」應萃取出「洗衣球」。不要公司名稱或修飾語。
3. 若真的無法歸類到任何已知分類，則將 recommended_category_id 設為 null，extracted_keyword 設為該物品的核心名詞。
4. 必須以 JSON 陣列格式回應，每個物件包含：souvenir_item, recommended_category_id, extracted_keyword。
`;

  const prompt = `
已知分類列表：
${JSON.stringify(categories, null, 2)}

未分類紀念品名單：
${JSON.stringify(unclassifiedItems, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '[]';
    // Validate and parse the output
    const parsed: ClassificationResult[] = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('AI Classification error:', error);
    throw new Error('AI 分類過程發生錯誤，請稍後再試。');
  }
}
