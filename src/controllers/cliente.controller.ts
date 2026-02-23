import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadImageToFirebase } from "../utils/uploadImage";
import { deleteImageFromFirebase } from "../utils/deleteImage";

/**
 * CREATE
 */
export async function createCliente(req: Request, res: Response) {
  try {
    const { nome, telefone, cpf, rg, userId } = req.body;
    const loggedUser = req.user!;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    let imagemUrl: string | undefined;

    // 🔥 Se enviou imagem, sobe pro Firebase
    if (req.file) {
      imagemUrl = await uploadImageToFirebase(req.file);
    }

    const ownerId =
      loggedUser.role === "ADMIN" && userId
        ? userId
        : loggedUser.id;

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        cpf,
        rg,
        imagemUrl,
        userId: ownerId,
      },
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error("ERRO CREATE CLIENTE:", error);
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
}

/**
 * LIST
 */
export async function listClientes(req: Request, res: Response) {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        user: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return res.json(clientes);
  } catch (error) {
    console.error("ERRO LIST CLIENTES:", error);
    return res.status(500).json({ error: "Erro ao listar clientes" });
  }
}

/**
 * DETAIL
 */
export async function getClienteById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    return res.json(cliente);
  } catch (error) {
    console.error("ERRO DETAIL CLIENTE:", error);
    return res.status(500).json({ error: "Erro ao buscar cliente" });
  }
}

/**
 * UPDATE
 * 🔥 Mantém regra antiga
 * 🔥 Se trocar imagem, apaga a antiga do Firebase
 */
export async function updateCliente(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const { nome, telefone, cpf, rg, userId } = req.body;
    const loggedUser = req.user!;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    if (
      loggedUser.role === "CONSULTOR" &&
      cliente.userId !== loggedUser.id
    ) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    let imagemUrl = cliente.imagemUrl;

    // 🔥 Se enviou nova imagem
    if (req.file) {
      // 🔥 Deleta antiga se existir
      if (cliente.imagemUrl) {
        await deleteImageFromFirebase(cliente.imagemUrl);
      }

      imagemUrl = await uploadImageToFirebase(req.file);
    }

    const updated = await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        telefone,
        cpf,
        rg,
        imagemUrl,
        userId,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("ERRO UPDATE CLIENTE:", error);
    return res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
}

/**
 * DELETE
 * 🔥 Apaga imagem do Firebase junto
 */
export async function deleteCliente(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const loggedUser = req.user!;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    if (
      loggedUser.role === "CONSULTOR" &&
      cliente.userId !== loggedUser.id
    ) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // 🔥 Apaga imagem do Firebase se existir
    if (cliente.imagemUrl) {
      await deleteImageFromFirebase(cliente.imagemUrl);
    }

    await prisma.cliente.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("ERRO DELETE CLIENTE:", error);
    return res.status(500).json({ error: "Erro ao deletar cliente" });
  }
}
