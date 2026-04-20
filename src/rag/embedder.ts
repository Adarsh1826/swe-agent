import { ChunkTypes } from "../types/rag-types/index.js";
import { VOYAGE_URL } from "../links.js";

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY!;

export interface EmbeddedChunk {
  chunk: ChunkTypes;
  embedding: number[];
}

const RATE_LIMIT = {
  RPM: 3,
  TPM: 10_000,
  DELAY_MS: 21_000, // 60s / 3 RPM + buffer
};

// Rough token estimator: ~4 chars per token
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Split texts into batches that respect the 10K TPM limit
function batchByTokenLimit(texts: string[], maxTokens = 9_000): string[][] {
  const batches: string[][] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const text of texts) {
    const tokens = estimateTokens(text);
    if (current.length > 0 && currentTokens + tokens > maxTokens) {
      batches.push(current);
      current = [text];
      currentTokens = tokens;
    } else {
      current.push(text);
      currentTokens += tokens;
    }
  }

  if (current.length > 0) batches.push(current);
  return batches;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callVoyageAPI(texts: string[]): Promise<number[][]> {
  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: "voyage-code-3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage API error: ${err}`);
  }

  const json = await res.json();
  return json.data.map((item: any) => item.embedding);
}

// Rate-limited wrapper: respects 3 RPM + 10K TPM
async function callVoyageRateLimited(texts: string[]): Promise<number[][]> {
  const batches = batchByTokenLimit(texts);
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < batches.length; i++) {
    if (i > 0) {
      console.log(`[Voyage] Waiting ${RATE_LIMIT.DELAY_MS / 1000}s for rate limit...`);
      await sleep(RATE_LIMIT.DELAY_MS);
    }
    const embeddings = await callVoyageAPI(batches[i]);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

// Embed the issue
export async function embedIssue(text: string): Promise<number[]> {
  const embeddings = await callVoyageRateLimited([text]);
  return embeddings[0];
}

// Embed all chunks with rate limiting
export async function embedChunk(chunks: ChunkTypes[]): Promise<EmbeddedChunk[]> {
  const texts = chunks.map((c) =>
    `
File: ${c.file}
Imports: ${c.fileImports ?? ""}
Type: ${c.type}
Name: ${c.name}
Lines: ${c.startLine}-${c.endLine}
Code:
${c.code}
`.trim()
  );

  const embeddings = await callVoyageRateLimited(texts);

  return chunks.map((chunk, i) => ({
    chunk,
    embedding: embeddings[i],
  }));
}