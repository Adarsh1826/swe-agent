// import fs from "fs";
// import path from "path";


// interface GeminiUpdatedFile {
//   path: string;
//   content: string;
// }

// interface GeminiResponse {
//   updatedFiles: GeminiUpdatedFile[];
// }

// export default async function sendThisToGeminiForFileUpadtionAccoringtoIssue({
//   issue,
//   files,
// }: {
//   issue: string;
//   files: { path: string; content: string }[];
// }): Promise<GeminiResponse> {
//   try {
//     // Build the prompt for Gemini
//     let prompt = `You are an AI assistant. Update the following project files according to the issue below.
    
// Issue: ${issue}

// Files:
// `;

//     files.forEach((file) => {
//       prompt += `\n--- FILE: ${file.path} ---\n${file.content}\n`;
//     });

//     prompt += `\nReturn the updated content of each file in JSON format like:
// [
//   { "path": "file/path.js", "content": "updated file content here" }
// ]`;

//     // Call Gemini REST API
//     const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         prompt,
//         temperature: 0, 
//         candidateCount: 1,
//       }),
//     });

//     if (!response.ok) {
//       const text = await response.text();
//       throw new Error(`Gemini API error: ${response.status} - ${text}`);
//     }

//     const data = await response.json();

//     // Gemini usually returns something like `candidates[0].content`
//     const rawContent = data?.candidates?.[0]?.content;
//     if (!rawContent) {
//       throw new Error("No content returned from Gemini");
//     }

//     // Parse JSON returned from Gemini
//     const updatedFiles: GeminiUpdatedFile[] = JSON.parse(rawContent);

//     console.log("Gemini returned updated files successfully!");
//     return { updatedFiles };
//   } catch (err: any) {
//     console.error("Error sending files to Gemini:", err.message);
//     throw err;
//   }
// }


interface GeminiUpdatedFile {
  path: string;
  content: string;
}

interface GeminiResponse {
  updatedFiles: GeminiUpdatedFile[];
}

export default async function sendThisToGeminiForFileUpadtionAccoringtoIssue({
  issue,
  files,
}: {
  issue: string;
  files: { path: string; content: string }[];
}): Promise<GeminiResponse> {
  try {
    // ---------- Build prompt ----------
    let prompt = `
You are an AI assistant that edits code.

Update the following project files according to the issue.

ISSUE:
${issue}

FILES:
`;

    files.forEach((file) => {
      prompt += `\n--- FILE: ${file.path} ---\n${file.content}\n`;
    });

    prompt += `
Return ONLY valid JSON (no markdown, no explanation):

[
  { "path": "file/path.js", "content": "updated file content here" }
]
`;

    // ---------- Gemini Call ----------
    const url =
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${text}`);
    }

    const data = await response.json();

    // ---------- Extract text ----------
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("No content returned from Gemini");
    }

    // ---------- Clean markdown wrapping ----------
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // ---------- Parse JSON ----------
    const updatedFiles: GeminiUpdatedFile[] = JSON.parse(cleaned);

    console.log("Gemini returned updated files successfully!");
    return { updatedFiles };

  } catch (err: any) {
    console.error("Error sending files to Gemini:", err.message);
    throw err;
  }
}
