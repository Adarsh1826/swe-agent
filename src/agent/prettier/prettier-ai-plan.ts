import { sendThisToGeminiForFileUpadtionAccoringtoIssue } from '../../llm/gemini/gemini.js';

export async function aiSelectPrettierFiles(
  files: string[],
): Promise<string[]> {
  const prompt = `
You are a senior software engineer.

The following files failed Prettier formatting:
${files.join('\n')}

Rules:
- Skip generated / config / build files
- Formatting only (no logic changes)

Return ONLY a JSON array of file paths.
`;

  const res =
    await sendThisToGeminiForFileUpadtionAccoringtoIssue({
      issue: prompt,
      files: [],
    });

  return JSON.parse(res.text || '[]');
}
