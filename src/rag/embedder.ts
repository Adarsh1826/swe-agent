// import { ChunkTypes } from "../types/rag-types/index.js";
// import { VOYAGE_URL } from "../links.js";

// const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY!;

// export interface EmbeddedChunk {
//   chunk: ChunkTypes;
//   embedding: number[];
// }


// async function callVoyageAPI(texts: string[]): Promise<number[][]> {
//   const res = await fetch(VOYAGE_URL, {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${VOYAGE_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       input: texts,
//       model: "voyage-code-3",
//     }),
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`Voyage API error: ${err}`);
//   }

//   const json = await res.json();
//   // Returns sorted by index
//   return json.data.map((item: any) => item.embedding);
// }

// // Embed the issue
// export async function embedIssue(text: string): Promise<number[]> {
//   const embeddings = await callVoyageAPI([text]);
//   return embeddings[0];
// }

// // Embed all chunks
// export async function embedChunk(chunks: ChunkTypes[]): Promise<EmbeddedChunk[]> {
//   const texts = chunks.map((c) => `
// File: ${c.file}
// Imports: ${c.fileImports ?? ""}
// Type: ${c.type}
// Name: ${c.name}
// Lines: ${c.startLine}-${c.endLine}
// Code:
// ${c.code}
// `.trim());

//   const embeddings = await callVoyageAPI(texts);

//   return chunks.map((chunk, i) => ({
//     chunk,
//     embedding: embeddings[i],
//   }));
// }


import { ChunkTypes } from "../types/rag-types/index.js";
import { VOYAGE_URL } from "../links.js";

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY!;

export interface EmbeddedChunk {
  chunk: ChunkTypes;
  embedding: number[];
}


async function callVoyageAPI(texts: string[], retries = 4): Promise<number[][]> {
  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: "voyage-code-3",
    }),
  });

  if (res.status === 429 && retries > 0) {
    // Rate limited — back off and retry instead of failing the whole job
    const retryAfter = res.headers.get("retry-after");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 20000; // default 20s
    console.warn(`Voyage rate limited. Retrying in ${waitMs / 1000}s... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return callVoyageAPI(texts, retries - 1);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage API error: ${err}`);
  }

  const json = await res.json();
  // Returns sorted by index
  return json.data.map((item: any) => item.embedding);
}

// Embed the issue
export async function embedIssue(text: string): Promise<number[]> {
  const embeddings = await callVoyageAPI([text]);
  return embeddings[0];
}

// Embed all chunks
export async function embedChunk(chunks: ChunkTypes[]): Promise<EmbeddedChunk[]> {
  const texts = chunks.map((c) => `
File: ${c.file}
Imports: ${c.fileImports ?? ""}
Type: ${c.type}
Name: ${c.name}
Lines: ${c.startLine}-${c.endLine}
Code:
${c.code}
`.trim());

  const embeddings = await callVoyageAPI(texts);

  return chunks.map((chunk, i) => ({
    chunk,
    embedding: embeddings[i],
  }));
}