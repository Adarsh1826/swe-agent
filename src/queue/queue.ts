import { prisma } from "../utils/db/db.js";
import installProjectDependencyAndStartProject from "../scripts/run-shell.js";
import path from "node:path";
import { parseFileToAST } from "../tools/ast/ast.js";
import { runRagPipeline } from "../rag/ragpipeline.js";
import { createPR } from "../tools/createpr/createpr.js";

// this function is just for picking all queued jobs
export default async function processQueue() {
  const jobs = await prisma.job.findMany({
    where: {
      status: "PENDING",
    },
  });

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const targetDir = path.join("/tmp", `swe-agent-${job.id}`);

    try {
      // Step 1: clone repo
      await cloningRepo(job.repoUrl, job.id);

      // Step 2: parse into chunks
      const chunks: any[] = [];
      await parseFileToAST(targetDir, chunks);

      // Step 3: run RAG pipeline → get fix
      const fix = await runRagPipeline(job.issueBody, chunks);

      // Step 4: create PR with fix
      const prUrl = await createPR(
        job.repoUrl,
        job.installationId,
        fix,
        job.issueNumber
      );

      // Step 5: mark job as completed
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });

      console.log(`✅ Job ${job.id} completed — PR: ${prUrl}`);
    } catch (err) {
      // mark job as failed so it doesn't retry forever
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "PENDING" },
      });
      console.error(`❌ Job ${job.id} failed:`, err);
    }
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

