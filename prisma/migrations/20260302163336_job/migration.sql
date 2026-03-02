/*
  Warnings:

  - You are about to drop the `Repo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Repo" DROP CONSTRAINT "Repo_userId_fkey";

-- DropTable
DROP TABLE "Repo";

-- DropEnum
DROP TYPE "RepoStatus";

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "userId" INTEGER,
    "guestId" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_guestId_idx" ON "Job"("guestId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
