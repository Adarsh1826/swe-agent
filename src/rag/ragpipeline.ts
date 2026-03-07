import { ChunkTypes } from "../types/rag-types/index.js";
import { embedIssue,embedChunk } from "./embedder.js";
import { storeEmbeddings,retrieveTopK } from "./retreiver.js";
import { callLLM } from "./llmcaller.js";


export async function runRagPipeline(
  issue: string,
  chunks: ChunkTypes[]
) {
  console.log(" Embedding chunks...");
  const embedded = await embedChunk(chunks);

  console.log(" Storing embeddings...");
  await storeEmbeddings(embedded);

  console.log("Embedding issue...");
  const issueVector = await embedIssue(issue);

  console.log(" Retrieving top chunks...");
  const topChunks = await retrieveTopK(issueVector, 5);

  console.log(" Calling LLM...");
  const fix = await callLLM(issue, topChunks);

  return fix;
}