import "dotenv/config";
import { ChunkTypes } from "./types/rag-types/index.js";
import { embedIssue, embedChunk } from "./rag/embedder.js";
import { storeEmbeddings, retrieveTopK } from "./rag/retreiver.js";
import { callLLM } from "./rag/llmcaller.js";

const testChunks: ChunkTypes[] = [
  {
    file: "src/auth/login.ts",
    type: "function",
    name: "login",
    code: `function login(user: string, password: string) {
      if (!user || !password) throw new Error("Missing credentials");
      return generateToken(user);
    }`,
    startLine: 10,
    endLine: 15,
    fileImports: "import { generateToken } from './token'",
  },
];

async function testRag() {
  const issue = "login function throws error when password is missing";

  console.log("🔄 Embedding and storing chunks...");
  const embedded = await embedChunk(testChunks);
  await storeEmbeddings(embedded);
  console.log("✅ Stored successfully");

  console.log("🔄 Retrieving relevant chunks...");
  const issueVector = await embedIssue(issue);
  const topChunks = await retrieveTopK(issueVector, 3);
  console.log(`✅ Retrieved ${topChunks.length} chunks`);

  console.log("🔄 Calling LLM...");
  const fix = await callLLM(issue, topChunks);
  console.log("✅ LLM Response:");
  console.log(fix);
}

testRag().catch(console.error);