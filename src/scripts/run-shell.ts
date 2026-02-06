import { spawn } from "child_process";

export default function runGitCloneShellScript(repoUrl:string) {

    const child = spawn("sh", ["/app/gitclone.sh", repoUrl]);

    child.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on("error", (error) => {
        console.error(`error: ${error.message}`);
    });

    child.on("close", (code) => {
        console.log(`Exited with code ${code}`);
    });
}
