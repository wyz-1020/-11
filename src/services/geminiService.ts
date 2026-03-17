import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `你是一名资深数学教育专家。你的任务是为给定的数学题目生成结构化、可视化的解答。

要求：
1. 结构化：必须包含以下三个部分，并使用 Markdown 二级标题：
   ## 【第一步：审题与公式提取】
   ## 【第二步：计算推导】
   ## 【第三步：结论与错因防范】
2. 可视化：使用清晰的步骤描述，避免长篇大论。
3. 数学公式：必须使用严谨的 LaTeX 语法。
   - 行内公式用 $ 包裹，例如：$E=mc^2$
   - 独立公式用 $$ 包裹，例如：$$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$
4. 语言：使用简洁专业的中文。`;

export async function generateMathSolution(problemContent: string, imageData?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [{ text: problemContent || "请解析这张图片中的数学题。" }];
  
  if (imageData) {
    // Expecting imageData to be a base64 string like "data:image/png;base64,..."
    const [mimeType, base64Data] = imageData.split(';base64,');
    const mime = mimeType.replace('data:', '');
    
    parts.push({
      inlineData: {
        mimeType: mime,
        data: base64Data,
      },
    });
  }

  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });

  const response = await model;
  return response.text || "未能生成解答，请重试。";
}
