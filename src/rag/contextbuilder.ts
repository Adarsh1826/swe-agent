import { RetrievedChunk } from "./retreiver.js";
// here buildeing context
export function buildContext(chunks: RetrievedChunk[]): string {
    return chunks
        .map((r, i) => `
Chunk ${i + 1} (score: ${r.score.toFixed(2)})
File: ${r.chunk.file}
Type: ${r.chunk.type}
Name: ${r.chunk.name}
Lines: ${r.chunk.startLine}-${r.chunk.endLine}
Imports: ${r.chunk.fileImports ?? "none"}
Code:
${r.chunk.code}
`.trim())
        .join("\n\n---\n\n");
}