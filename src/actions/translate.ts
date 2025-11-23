"use server";

import OpenAI from "openai";

export interface TranslationData {
  zh: string;
  en: string;
  ja: string;
  terms: string;
}

export async function translateText(
  apiKey: string,
  text: string,
  context: string
): Promise<{ success: boolean; data?: TranslationData; error?: string }> {
  if (!apiKey) return { success: false, error: "API Key is required" };

  // 初始化 client (注意：在 server action 中每次初始化是安全的，因為這是無狀態的)
  const openai = new OpenAI({ 
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // 雖然是 server action，但有時候 Next.js 的邊界處理會誤報，加上這行通常沒壞處，但在 server env 其實不需要。不過為了確保傳遞的 key 能用，標準做法是在 server 側用。
  });
  // 修正：server action 跑在 node 環境，不需要 dangerouslyAllowBrowser。

  try {
    const systemPrompt = `
You are a professional translator specializing in "${context || "General"}".
Your task is to translate the input text into Traditional Chinese (Taiwan), English, and Japanese.
Additionally, extract key terms and provide brief background knowledge or definitions relevant to the industry.

Return ONLY a valid JSON object with the following structure:
{
  "zh": "Traditional Chinese translation",
  "en": "English translation",
  "ja": "Japanese translation",
  "terms": "Key terms explanations and background context. Use bullet points or newlines for readability."
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content returned from OpenAI");

    const result = JSON.parse(content) as TranslationData;
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Translation Error:", error);
    return { success: false, error: error.message || "Translation failed" };
  }
}

