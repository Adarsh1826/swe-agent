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
export default async function installProjectDependencyAndStartProject(repoUrl: string,targetDir:string) {
  try {
    

    console.log("Cloning repo...");
    await runGitCloneShellScript(repoUrl, targetDir);

    console.log("Installing dependencies...");
    await runShellScript("/app/src/shell/setup.sh", [targetDir]);

    console.log("Project setup complete!");

    return targetDir;
  } catch (err: any) {
    console.error("Error installing project dependency:", err.message);
    throw err;
  }
}
