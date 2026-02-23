"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPayments = checkPayments;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
async function checkPayments() {
    const hoje = new Date();
    const users = await prisma_1.prisma.user.findMany({
        where: { role: client_1.UserRole.CONSULTOR },
    });
    for (const user of users) {
        const diffMs = user.proximoPagamento.getTime() - hoje.getTime();
        const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        // BLOQUEADO se atrasou
        if (diffDias <= 0 && user.status !== client_1.AccountStatus.BLOQUEADO) {
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { status: client_1.AccountStatus.BLOQUEADO },
            });
        }
        // AVISO se falta até 7 dias
        if (diffDias > 0 && diffDias <= 7 && user.status === client_1.AccountStatus.ATIVO) {
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { status: client_1.AccountStatus.AVISO },
            });
        }
    }
}
