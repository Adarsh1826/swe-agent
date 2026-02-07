// import { spawn } from "child_process";

// export default function runGitCloneShellScript(repoUrl:string) {

//     const child = spawn("/app/src/shell/gitclone.sh", [repoUrl]);

//     child.stdout.on("data", (data) => {
//         console.log(`stdout: ${data}`);
//     });

//     child.stderr.on("data", (data) => {
//         console.error(`stderr: ${data}`);
//     });

//     child.on("error", (error) => {
//         console.error(`error: ${error.message}`);
//     });

//     child.on("close", (code) => {
//         console.log(`Exited with code ${code}`);
//     });
// }


import { spawn } from "child_process";
import path from "path";

// Helper to run a shell script and wait for it to finish
export function runShellScript(scriptPath: string, args: string[] = [], cwd?: string): Promise<void> {
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

// Your existing git clone function
export function runGitCloneShellScript(repoUrl: string) {
    return runShellScript("/app/src/shell/gitclone.sh", [repoUrl]);
}

// New async function to clone + install + start project
export default async function installProjectDependency(repoUrl: string) {
    try {
        const TARGET_DIR = "/tmp";

        // Extract repo name from URL
        const repoName = repoUrl.split("/").pop()?.replace(".git", "");
        if (!repoName) throw new Error("Invalid repo URL");

        const repoPath = path.join(TARGET_DIR, repoName);

        console.log("Cloning repo...");
        await runGitCloneShellScript(repoUrl);

        console.log("Installing dependencies and starting project...");
        await runShellScript("/app/src/shell/setup.sh", [repoPath]);

        console.log("Project setup complete!");
    } catch (err: any) {
        console.error("Error installing project dependency:", err.message);
    }
}
