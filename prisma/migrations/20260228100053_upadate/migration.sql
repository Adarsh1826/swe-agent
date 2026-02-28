/*
  Warnings:

  - Added the required column `iv` to the `Apis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Apis" ADD COLUMN     "iv" TEXT NOT NULL;
