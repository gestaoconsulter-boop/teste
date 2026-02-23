import { PrismaClient, UserRole, AccountStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpando banco...");
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();

  console.log("👑 Criando ADMIN único...");

  const senhaHash = await bcrypt.hash("Mauricio961507@", 10);

  const admin = await prisma.user.create({
    data: {
      nome: "Administrador",
      email: "gestaoconsulter@gmail.com",
      cpf: "00000000000",
      senha: senhaHash,
      role: UserRole.ADMIN,
      status: AccountStatus.ATIVO,
      proximoPagamento: new Date("2099-01-01"),
    },
  });

  console.log("✅ Seed finalizado com sucesso!");
  console.log("👑 Admin criado:", admin.email);
  console.log("🔐 Senha: Mauricio961507@");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });