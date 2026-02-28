-- CreateTable
CREATE TABLE "Apis" (
    "id" SERIAL NOT NULL,
    "providerName" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,

    CONSTRAINT "Apis_pkey" PRIMARY KEY ("id")
);
