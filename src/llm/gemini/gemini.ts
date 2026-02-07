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
You are an autonomous senior software engineer.

Your PRIMARY objective is to follow the issue request EXACTLY.
Do NOT reinterpret the task into a different architecture.

RULES:
- If the issue requests a specific file type (HTML, CSS, etc), CREATE THAT FILE
- Do NOT replace requested files with server-side alternatives
- Only introduce backend code if explicitly requested
- Prefer minimal changes that satisfy the issue literally

CAPABILITIES:
- Modify existing files
- Create new files
- Add supporting assets
- Return full contents of each changed file

OUTPUT RULES:
- Only JSON
- No markdown
- No explanation
- Return ALL created/updated files
- Empty array if nothing needed

ISSUE:
${issue}

CURRENT FILES:
${filesText}

FORMAT:
[
  { "path": "relative/path.ext", "content": "full file text" }
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
    console.log(aiText);
    
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    const updatedFiles: GeminiUpdatedFile[] =
      jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return { updatedFiles };

  } catch (error) {
    console.error("Gemini fetch error:", error);
    return { updatedFiles: [] };
  }
}
