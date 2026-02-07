import { GeminiResponse } from "../../types/geminitypes/gemini-types.js";
import { GeminiUpdatedFile } from "../../types/geminitypes/gemini-types.js";

export async function sendThisToGeminiForFileUpadtionAccoringtoIssue({
  issue,
  files,
}: {
  issue: string;
  files: { path: string; content: string }[];
}): Promise<GeminiResponse> {

  if (!files || files.length === 0) {
    return { updatedFiles: [] };
  }

  // Build file text (same pattern as aiReview)
  let filesText = "";
  for (const file of files) {
    filesText += `
File: ${file.path}
---------------------
${file.content}
`;
  }

const prompt = `
You are an autonomous senior software engineer working on a real production repository.

Your task is to solve the issue by:
- Updating existing files when necessary
- Creating NEW files if required
- Adding supporting files (HTML/CSS/JS/config/tests/etc.)
- Choosing appropriate filenames and extensions
- Following the project's existing structure and style
- Making minimal, correct, production-ready changes

IMPORTANT RULES:
- You are NOT limited to the provided files
- If the solution requires new files, create them
- Return ALL changed or newly created files
- Every file must include FULL FINAL CONTENT
- Do NOT include explanations
- Do NOT include markdown
- Output ONLY valid JSON

ISSUE:
${issue}

CURRENT PROJECT FILES:
${filesText}

OUTPUT FORMAT (STRICT):
[
  { "path": "relative/path/to/file.ext", "content": "complete file content" }
]
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract JSON safely
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    const updatedFiles: GeminiUpdatedFile[] =
      jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return { updatedFiles };

  } catch (error) {
    console.error("Gemini fetch error:", error);
    return { updatedFiles: [] };
  }
}
