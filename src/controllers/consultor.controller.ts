import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { AccountStatus, UserRole } from "@prisma/client";
import { uploadImageToFirebase } from "../utils/uploadImage";

/**
 * CREATE — ADMIN cria consultor
 */
export async function createConsultor(req: Request, res: Response) {
  const loggedUser = req.user!;

  if (loggedUser.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const { nome, email, cpf, senha, proximoPagamento } = req.body;

    let imagemUrl: string | undefined;

    if (req.file) {
      imagemUrl = await uploadImageToFirebase(req.file);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const consultor = await prisma.user.create({
      data: {
        nome,
        email,
        cpf,
        senha: senhaHash,
        role: UserRole.CONSULTOR,
        proximoPagamento: new Date(proximoPagamento),
        imagemUrl,
      },
    });

    return res.status(201).json(consultor);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "CPF ou e-mail já cadastrado",
      });
    }

    console.error("ERRO CREATE CONSULTOR:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
}

/**
 * LIST — listar consultores
 */
export async function listConsultores(req: Request, res: Response) {
  const consultores = await prisma.user.findMany({
    where: { role: UserRole.CONSULTOR },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      status: true,
      proximoPagamento: true,
      imagemUrl: true,
      criadoEm: true,
    },
  });

  return res.json(consultores);
}

/**
 * UPDATE — atualizar consultor
 */
export async function updateConsultor(
  req: Request<{ id: string }>,
  res: Response
) {
  const loggedUser = req.user!;
  const { id } = req.params;
  const { nome, email, cpf, proximoPagamento, status } = req.body;

  const consultor = await prisma.user.findUnique({ where: { id } });

  if (!consultor || consultor.role !== UserRole.CONSULTOR) {
    return res.status(404).json({ error: "Consultor não encontrado" });
  }

  if (loggedUser.role === UserRole.CONSULTOR && loggedUser.id !== consultor.id) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  let imagemUrl: string | undefined;

  if (req.file) {
    imagemUrl = await uploadImageToFirebase(req.file);
  }

  const data: any = {};

  if (nome !== undefined) data.nome = nome;
  if (email !== undefined) data.email = email;
  if (cpf !== undefined) data.cpf = cpf;
  if (imagemUrl !== undefined) data.imagemUrl = imagemUrl;

  if (proximoPagamento && loggedUser.role === UserRole.ADMIN) {
    data.proximoPagamento = new Date(proximoPagamento);
  }

  if (status && loggedUser.role === UserRole.ADMIN) {
    data.status = status;
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      status: true,
      proximoPagamento: true,
      imagemUrl: true,
      criadoEm: true,
    },
  });

  return res.json(updated);
}

/**
 * DELETE — remover consultor
 */
export async function deleteConsultor(
  req: Request<{ id: string }>,
  res: Response
) {
  const loggedUser = req.user!;
  if (loggedUser.role !== UserRole.ADMIN)
    return res.status(403).json({ error: "Acesso negado" });

  const { id } = req.params;
  const consultor = await prisma.user.findUnique({ where: { id } });

  if (!consultor || consultor.role !== UserRole.CONSULTOR) {
    return res.status(404).json({ error: "Consultor não encontrado" });
  }

  await prisma.user.delete({ where: { id } });
  return res.status(204).send();
}

/**
 * LIST — listar consultores BLOQUEADOS
 */
export async function listConsultoresBloqueados(req: Request, res: Response) {
  const consultores = await prisma.user.findMany({
    where: {
      role: UserRole.CONSULTOR,
      status: AccountStatus.BLOQUEADO,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      status: true,
      proximoPagamento: true,
      imagemUrl: true,
      criadoEm: true,
    },
  });

  return res.json(consultores);
}

/**
 * LISTAR CONSULTORES PARA TRANSFERÊNCIA
 */
export async function listConsultoresParaTransferencia(req: Request, res: Response) {
  const loggedUser = req.user!;
  if (loggedUser.role !== UserRole.CONSULTOR)
    return res.status(403).json({ error: "Sem permissão" });

  const consultores = await prisma.user.findMany({
    where: {
      role: UserRole.CONSULTOR,
      status: AccountStatus.ATIVO,
      id: { not: loggedUser.id },
    },
    select: {
      id: true,
      nome: true,
      email: true,
      imagemUrl: true,
    },
  });

  return res.json(consultores);
}

/**
 * GET — buscar consultor por ID
 */
export async function getConsultorById(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params;

  const consultor = await prisma.user.findFirst({
    where: { id, role: UserRole.CONSULTOR },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      status: true,
      proximoPagamento: true,
      imagemUrl: true,
      criadoEm: true,
    },
  });

  if (!consultor)
    return res.status(404).json({ error: "Consultor não encontrado" });

  return res.json(consultor);
}


/**
 * UPDATE STATUS — ADMIN bloqueia/desbloqueia consultor
 */
export async function updateStatusConsultor(
  req: Request<{ consultorId: string }>,
  res: Response
) {
  const loggedUser = req.user!;
  const { consultorId } = req.params;
  const { status } = req.body;

  if (loggedUser.role !== UserRole.ADMIN)
    return res.status(403).json({ error: "Acesso negado" });

  if (!Object.values(AccountStatus).includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }

  try {
    const consultor = await prisma.user.update({
      where: { id: consultorId },
      data: { status },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        status: true,
        proximoPagamento: true,
        imagemUrl: true,
        criadoEm: true,
      },
    });

    return res.json(consultor);
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Consultor não encontrado" });

    return res.status(400).json({
      error: "Erro ao atualizar status do consultor",
      details: error.message,
    });
  }
}
