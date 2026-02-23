/*
  Warnings:

  - You are about to drop the column `cpf` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `fotoUrl` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `rg` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `fotoUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `proximoPagamentoEm` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `senhaHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ClienteConsultor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proximoPagamento` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CONSULTOR');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ATIVO', 'AVISO', 'BLOQUEADO');

-- DropForeignKey
ALTER TABLE "ClienteConsultor" DROP CONSTRAINT "ClienteConsultor_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "ClienteConsultor" DROP CONSTRAINT "ClienteConsultor_consultorId_fkey";

-- DropIndex
DROP INDEX "Cliente_cpf_key";

-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "cpf",
DROP COLUMN "endereco",
DROP COLUMN "fotoUrl",
DROP COLUMN "rg",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fotoUrl",
DROP COLUMN "proximoPagamentoEm",
DROP COLUMN "senhaHash",
DROP COLUMN "telefone",
ADD COLUMN     "proximoPagamento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "senha" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CONSULTOR',
DROP COLUMN "status",
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'ATIVO';

-- DropTable
DROP TABLE "ClienteConsultor";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "StatusUsuario";

-- DropEnum
DROP TYPE "StatusVinculo";

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
