/*
  Warnings:

  - You are about to drop the column `email` on the `Cliente` table. All the data in the column will be lost.
  - Added the required column `cpf` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagemUrl` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rg` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Made the column `telefone` on table `Cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "email",
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "imagemUrl" TEXT NOT NULL,
ADD COLUMN     "rg" TEXT NOT NULL,
ALTER COLUMN "telefone" SET NOT NULL;
