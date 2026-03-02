import { prisma } from "../utils/db/db.js";

import installProjectDependencyAndStartProject from "../scripts/run-shell.js";
// ab me ek ek pending job lunga aur shell script kaame krega

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

        const repoUrl = initialJob.repoUrl;

        //const res = installProjectDependencyAndStartProject(repoUrl)

        // abb isme sara thing krenege then funally staus update ke denfe

        await prisma.job.update({
            where: {
                repoUrl_issueNumber: {
                    repoUrl: repoUrl,
                    issueNumber: initialJob.issueNumber
                }
            },
            data: {
                status: "COMPLETED"
            }
        })


    }

}