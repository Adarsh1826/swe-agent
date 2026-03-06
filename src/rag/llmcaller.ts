import { groqClient } from "../llm/groq.js";
import { buildPrompt } from "./promptbuilder.js";
import { RetrievedChunk } from "./retreiver.js";

export interface LLMFix {
  filePath: string;
  fixedCode: string;
}

export async function callLLM(
  issue: string,
  chunks: RetrievedChunk[]
): Promise<LLMFix> {
  const prompt = buildPrompt(issue, chunks);

  const response = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const raw = response.choices[0].message.content ?? "";

  // strip markdown code fences if LLM wraps in ```json
  const clean = raw.replace(/```json|```/g, "").trim();

  const fix: LLMFix = JSON.parse(clean);
  return fix;
}