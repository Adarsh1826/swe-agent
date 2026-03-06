import { buildContext } from "./contextbuilder.js";
import { RetrievedChunk } from "./retreiver.js";

export function buildPrompt(issue: string, chunks: RetrievedChunk[]): string {
  const context = buildContext(chunks);

  return `
You are an expert software engineer. Your job is to fix bugs in a codebase.

## Issue
${issue}

## Relevant Code
${context}

## Instructions
- Analyze the issue and the relevant code
- Return ONLY a JSON object, no explanation, no markdown, no extra text
- The JSON must follow this exact structure:

{
  "filePath": "relative path to the file that needs to be changed",
  "fixedCode": "the complete fixed file content"
}
`.trim();
}