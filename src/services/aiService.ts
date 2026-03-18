import OpenAI from "openai";

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
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseURL = process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const modelName = process.env.DASHSCOPE_MODEL || "qvq-max-2025-03-25";

  if (!apiKey) {
    throw new Error("DashScope API Key is missing. Please configure it in the Secrets panel.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });

  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "text", text: problemContent || "请解析这张图片中的数学题。" },
      ],
    },
  ];

  if (imageData) {
    messages[1].content.push({
      type: "image_url",
      image_url: {
        url: imageData,
      },
    });
  }

  const response = await client.chat.completions.create({
    model: modelName,
    messages,
  });

  return response.choices[0]?.message?.content || "未能生成解答，请重试。";
}
