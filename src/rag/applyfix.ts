import fs from "node:fs/promises";
import path from "node:path";
import { LLMFix } from "./llmcaller.js";

export async function applyFix(
  repoDir: string,
  fix: LLMFix
): Promise<string> {
  const fullPath = path.join(repoDir, fix.filePath);

  await fs.writeFile(fullPath, fix.fixedCode, "utf-8");

  console.log(`✅ Fix applied to ${fullPath}`);

  return fullPath;
}