import { prisma } from "../utils/db/db.js";
import installProjectDependencyAndStartProject from "../scripts/run-shell.js";
import path from "node:path";
import { parseFileToAST } from "../tools/ast/ast.js";
// this function is just for picking all queued jobs
export default async function processQueue() {
    let jobs = [];

    jobs = await prisma.job.findMany({
        where: {
            status: "PENDING"
        }
    })

    // now i have all jobs now i will process one by one

    for (let i = 0; i < jobs.length; i++) {
        let initialJob = jobs[i];
        const targetDir = path.join("/tmp", `swe-agent-${initialJob.id}`)

        const res = await cloningRepo(initialJob.repoUrl,initialJob.id)
        let chunks:any =[]
        await parseFileToAST(targetDir,chunks)

    }

}

// now i have job means repo url and all now i will clone it and proceed further
export async function cloningRepo(repoUrl:string,id:number){
    // cloning part is done
    const targetDir = path.join("/tmp", `swe-agent-${id}`)
    const res = await installProjectDependencyAndStartProject(repoUrl,targetDir)
    const chunks =[]


    // now  repo is cloned and started now i need to move to next step

}

