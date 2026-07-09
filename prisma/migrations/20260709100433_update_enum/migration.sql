/*
  Warnings:

  - The values [CONFIRMED] on the enum `RentalOrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentalOrderStatus_new" AS ENUM ('PLACED', 'CANCELLED', 'PAID', 'PICKED_UP', 'RETURNED');
ALTER TABLE "public"."rental_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rental_orders" ALTER COLUMN "status" TYPE "RentalOrderStatus_new" USING ("status"::text::"RentalOrderStatus_new");
ALTER TYPE "RentalOrderStatus" RENAME TO "RentalOrderStatus_old";
ALTER TYPE "RentalOrderStatus_new" RENAME TO "RentalOrderStatus";
DROP TYPE "public"."RentalOrderStatus_old";
ALTER TABLE "rental_orders" ALTER COLUMN "status" SET DEFAULT 'PLACED';
COMMIT;
