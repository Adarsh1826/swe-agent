import fs from "fs";
import path from "path";

const IGNORE = [
  "node_modules",
  ".git",
  "package.json",
  "package-lock.json",
  "yarn.lock",
];

export function collectRepoFiles(repoPath: string): string {
  function getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (IGNORE.includes(file)) return;

      if (stat.isDirectory()) {
        getAllFiles(fullPath, fileList);
      } else {
        fileList.push(fullPath);
      }
    });
    return fileList;
  }

  const filesToSend = getAllFiles(repoPath);

  let allFilesContent = "";
  filesToSend.forEach((file) => {
    const relativePath = path.relative(repoPath, file);
    const content = fs.readFileSync(file, "utf8");
    allFilesContent += `\n\n// FILE: ${relativePath}\n${content}`;
  });

  return allFilesContent;
}
