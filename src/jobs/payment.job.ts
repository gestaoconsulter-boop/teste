import { prisma } from "../lib/prisma";
import { UserRole, AccountStatus } from "@prisma/client";

export async function checkPayments() {
  const hoje = new Date();

  const users = await prisma.user.findMany({
    where: { role: UserRole.CONSULTOR },
  });

  for (const user of users) {
    const diffMs = user.proximoPagamento.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // BLOQUEADO se atrasou
    if (diffDias <= 0 && user.status !== AccountStatus.BLOQUEADO) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: AccountStatus.BLOQUEADO },
      });
    }

    // AVISO se falta até 7 dias
    if (diffDias > 0 && diffDias <= 7 && user.status === AccountStatus.ATIVO) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: AccountStatus.AVISO },
      });
    }
  }
}
