-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CONSULTOR');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "StatusVinculo" AS ENUM ('ATIVO', 'PENDENTE', 'DUPLICADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "senhaHash" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "role" "Role" NOT NULL,
    "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO',
    "proximoPagamentoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "fotoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteConsultor" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "consultorId" TEXT NOT NULL,
    "status" "StatusVinculo" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClienteConsultor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "ClienteConsultor_clienteId_consultorId_key" ON "ClienteConsultor"("clienteId", "consultorId");

-- AddForeignKey
ALTER TABLE "ClienteConsultor" ADD CONSTRAINT "ClienteConsultor_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteConsultor" ADD CONSTRAINT "ClienteConsultor_consultorId_fkey" FOREIGN KEY ("consultorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
