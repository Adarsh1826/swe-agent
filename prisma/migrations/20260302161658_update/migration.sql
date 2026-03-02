/*
  Warnings:

  - Added the required column `status` to the `Repo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RepoStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "repoStatus" "RepoStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "status" TEXT NOT NULL;
