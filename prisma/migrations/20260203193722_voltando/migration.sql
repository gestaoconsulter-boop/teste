/*
  Warnings:

  - You are about to drop the column `cpf` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `rg` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Cliente_cpf_key";

-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "cpf",
DROP COLUMN "endereco",
DROP COLUMN "rg",
ADD COLUMN     "email" TEXT,
ALTER COLUMN "telefone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "telefone";
