/*
  Warnings:

  - You are about to drop the column `barcode` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `SaleItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceAtSale` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Medicine_barcode_key";

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "barcode",
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "total",
ADD COLUMN     "commissionAmount" DOUBLE PRECISION,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "SaleItem" DROP COLUMN "subtotal",
DROP COLUMN "unitPrice",
ADD COLUMN     "priceAtSale" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_code_key" ON "Medicine"("code");
