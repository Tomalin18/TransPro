"use server";

import OpenAI from "openai";

export interface TranslationData {
  zh: string;
  en: string;
  ja: string;
  terms: {
    zh: string;
    en: string;
    ja: string;
  };
}

export async function translateText(
  apiKey: string,
  text: string,
  context: string
): Promise<{ success: boolean; data?: TranslationData; error?: string }> {
  if (!apiKey) return { success: false, error: "API Key is required" };

  const openai = new OpenAI({ 
    apiKey: apiKey,
  });

  try {
    const systemPrompt = `
You are a professional translator specializing in "${context || "General"}".
Your task is to translate the input text into Traditional Chinese (Taiwan), English, and Japanese.
Additionally, extract key terms and provide brief background knowledge or definitions relevant to the industry in ALL three languages.

STRICT RULE: All Chinese output MUST be in Traditional Chinese (Taiwan). NEVER use Simplified Chinese characters.

Return ONLY a valid JSON object with the following structure:
{
  "zh": "Traditional Chinese translation (Taiwan usage)",
  "en": "English translation",
  "ja": "Japanese translation",
  "terms": {
    "zh": "Key terms explanations and background context in Traditional Chinese.",
    "en": "Key terms explanations and background context in English.",
    "ja": "Key terms explanations and background context in Japanese."
  }
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
