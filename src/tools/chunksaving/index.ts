import fs from "fs/promises";
import path from "path";
import { ChunkTypes } from "../../types/rag-types/index.js";

export async function saveChunks(chunks: ChunkTypes[]) {

  const outDir = path.join(process.cwd(), "data");

  
  await fs.mkdir(outDir, { recursive: true });

  const filePath = path.join(outDir, "chunks.json");

  await fs.writeFile(
    filePath,
    JSON.stringify(chunks, null, 2),
    "utf-8"
  );

  console.log("Chunks stored at:", filePath);
}
