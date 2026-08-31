-- DropIndex
DROP INDEX "Department_name_key";

-- DropIndex
DROP INDEX "Medicine_name_key";

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "organizationId" TEXT;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
