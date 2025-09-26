-- CreateEnum
CREATE TYPE "ConversionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "total_conversions" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "conversions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "converted_file_name" TEXT,
    "tool_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "status" "ConversionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
