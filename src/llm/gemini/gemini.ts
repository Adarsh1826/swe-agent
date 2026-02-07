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
You are an expert software engineer.

Update the following project files according to this issue.

ISSUE:
${issue}

FILES:
${filesText}

Return ONLY valid JSON (no markdown, no explanation):
[
  { "path": "file/path.js", "content": "updated content here" }
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
