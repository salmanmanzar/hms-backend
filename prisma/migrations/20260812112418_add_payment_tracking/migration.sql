/*
  Warnings:

  - A unique constraint covering the columns `[paymentIntentId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "paymentIntentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_paymentIntentId_key" ON "Appointment"("paymentIntentId");
