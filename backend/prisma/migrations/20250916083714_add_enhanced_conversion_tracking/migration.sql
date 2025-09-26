/*
  Warnings:

  - Added the required column `processing_location` to the `conversions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProcessingLocation" AS ENUM ('FRONTEND', 'BACKEND');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('WORD', 'EXCEL', 'POWERPOINT', 'PDF', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'CONVERTING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "conversions" DROP CONSTRAINT "conversions_user_id_fkey";

-- AlterTable
ALTER TABLE "conversions" ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "is_authenticated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processing_location" "ProcessingLocation" NOT NULL,
ADD COLUMN     "user_agent" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "file_records" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "original_extension" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "FileStatus" NOT NULL DEFAULT 'PENDING',
    "file_size" INTEGER NOT NULL,
    "download_url" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_records" ADD CONSTRAINT "file_records_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
