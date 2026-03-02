/*
  Warnings:

  - A unique constraint covering the columns `[repoUrl,issueNumber]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Job_repoUrl_issueNumber_key" ON "Job"("repoUrl", "issueNumber");
