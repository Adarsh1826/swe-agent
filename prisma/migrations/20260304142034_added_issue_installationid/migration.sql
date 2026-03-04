/*
  Warnings:

  - Added the required column `installationId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issueBody` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issueTitle` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "installationId" INTEGER NOT NULL,
ADD COLUMN     "issueBody" TEXT NOT NULL,
ADD COLUMN     "issueTitle" TEXT NOT NULL;
