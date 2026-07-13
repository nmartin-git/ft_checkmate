-- AlterEnum
ALTER TYPE "follow_status" ADD VALUE 'REFUSED';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "is_online" SET DEFAULT false;
