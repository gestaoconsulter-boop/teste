/*
  Warnings:

  - You are about to drop the column `email` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `imagemUrl` on the `Cliente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endereco` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rg` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Made the column `telefone` on table `Cliente` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `telefone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "email",
DROP COLUMN "imagemUrl",
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "endereco" TEXT NOT NULL,
ADD COLUMN     "rg" TEXT NOT NULL,
ALTER COLUMN "telefone" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telefone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");
