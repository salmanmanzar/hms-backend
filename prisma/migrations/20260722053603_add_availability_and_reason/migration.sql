-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "availability" JSONB;
