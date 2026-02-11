import { spawn } from "child_process";
import path from "path";
import fs from "fs";

// Helper to run a shell script and wait for it to finish
export function runShellScript(
  scriptPath: string,
  args: string[] = [],
  cwd?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(scriptPath, args, { cwd, shell: true });

    child.stdout.on("data", (data) => {
      console.log(`${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`${data}`);
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
}

export function runGitCloneShellScript(repoUrl: string, targetDir: string) {
  return runShellScript("/app/src/shell/gitclone.sh", [repoUrl, targetDir]);
}

// function to clone install and start
export default async function installProjectDependency(repoUrl: string) {
  try {
    const TARGET_DIR = "/tmp/repos";

    const repoName = repoUrl.split("/").pop()?.replace(".git", "");
    if (!repoName) throw new Error("Invalid repo URL");

    const repoPath = path.join(TARGET_DIR, repoName);

    await fs.promises.mkdir(TARGET_DIR, { recursive: true });

    console.log("Cloning repo...");
    await runGitCloneShellScript(repoUrl, repoPath);

    console.log("Installing dependencies...");
    await runShellScript("/app/src/shell/setup.sh", [repoPath]);

    console.log("Project setup complete!");

    return repoPath;
  } catch (err: any) {
    console.error("Error installing project dependency:", err.message);
    throw err;
  }
}
