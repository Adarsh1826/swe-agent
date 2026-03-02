-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "status" "StatusEnum" NOT NULL DEFAULT 'PENDING';
