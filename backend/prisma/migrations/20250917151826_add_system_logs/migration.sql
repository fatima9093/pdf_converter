-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('CONVERSION_ERROR', 'LOGIN_FAILURE', 'SYSTEM_ERROR', 'SECURITY_ALERT', 'USER_ACTION', 'API_ERROR');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "user_id" TEXT,
    "user_email" TEXT,
    "severity" "LogSeverity" NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
