import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function transferirCliente(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params; // id do cliente
  const { novoConsultorId } = req.body;
  const loggedUser = req.user!;

  // Apenas CONSULTOR pode transferir
  if (loggedUser.role !== "CONSULTOR") {
    return res.status(403).json({
      error: "Apenas consultores podem transferir clientes",
    });
  }

  if (!novoConsultorId) {
    return res.status(400).json({
      error: "novoConsultorId é obrigatório",
    });
  }

  // Verifica se o cliente existe
  const cliente = await prisma.cliente.findUnique({
    where: { id },
  });

  if (!cliente) {
    return res.status(404).json({
      error: "Cliente não encontrado",
    });
  }

  // Cliente pertence ao consultor logado?
  if (cliente.userId !== loggedUser.id) {
    return res.status(403).json({
      error: "Você não pode transferir um cliente que não é seu",
    });
  }

  // Verifica se o novo consultor existe e é CONSULTOR
  const novoConsultor = await prisma.user.findUnique({
    where: { id: novoConsultorId },
  });

  if (!novoConsultor || novoConsultor.role !== "CONSULTOR") {
    return res.status(400).json({
      error: "Consultor de destino inválido",
    });
  }

  // Atualiza o cliente
  const updated = await prisma.cliente.update({
    where: { id },
    data: {
      userId: novoConsultorId,
    },
  });

  return res.json({
    message: "Cliente transferido com sucesso",
    cliente: updated,
  });
}
