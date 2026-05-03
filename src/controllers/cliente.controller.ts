import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadImageToFirebase } from "../utils/uploadImage";
import { deleteImageFromFirebase } from "../utils/deleteImage";
import crypto from "crypto";

/* =========================
   🔐 CRIPTO
========================= */

const algorithm = "aes-256-cbc";
const secret = process.env.CRYPTO_SECRET || "chave-super-secreta";

const key = crypto.createHash("sha256").update(secret).digest();

function encrypt(text: string) {
  if (!text) return text;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(hash: string) {
  try {
    if (!hash || !hash.includes(":")) return hash;

    const [ivHex, encryptedText] = hash.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    return hash;
  }
}

/* =========================
   CREATE
========================= */

export async function createCliente(req: Request, res: Response) {
  try {
    const {
      nome,
      telefone,
      cpf,
      rg,
      userId,
      apelido,
      observacao,
    } = req.body;

    const loggedUser = req.user!;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (observacao && observacao.length > 250) {
      return res.status(400).json({
        error: "Observação deve ter no máximo 250 caracteres",
      });
    }

    let imagemUrl: string | undefined;

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
        cpf: encrypt(cpf),
        rg: encrypt(rg),
        imagemUrl,
        userId: ownerId,
        apelido,
        observacao,
      },
    });

    return res.status(201).json({
      ...cliente,
      cpf,
      rg,
    });
  } catch (error) {
    console.error("ERRO CREATE CLIENTE:", error);
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
}

/* =========================
   LIST
========================= */

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

    const formatted = clientes.map((c) => ({
      ...c,
      cpf: c.cpf && c.cpf.includes(":") ? decrypt(c.cpf) : c.cpf,
      rg: c.rg && c.rg.includes(":") ? decrypt(c.rg) : c.rg,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("ERRO LIST CLIENTES:", error);
    return res.status(500).json({ error: "Erro ao listar clientes" });
  }
}

/* =========================
   DETAIL
========================= */

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

    return res.json({
      ...cliente,
      cpf:
        cliente.cpf && cliente.cpf.includes(":")
          ? decrypt(cliente.cpf)
          : cliente.cpf,
      rg:
        cliente.rg && cliente.rg.includes(":")
          ? decrypt(cliente.rg)
          : cliente.rg,
    });
  } catch (error) {
    console.error("ERRO DETAIL CLIENTE:", error);
    return res.status(500).json({ error: "Erro ao buscar cliente" });
  }
}

/* =========================
   UPDATE
========================= */

export async function updateCliente(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const {
      nome,
      telefone,
      cpf,
      rg,
      userId,
      apelido,
      observacao,
    } = req.body;

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

    if (observacao && observacao.length > 250) {
      return res.status(400).json({
        error: "Observação deve ter no máximo 250 caracteres",
      });
    }

    let imagemUrl = cliente.imagemUrl;

    if (req.file) {
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
        cpf: cpf ? encrypt(cpf) : cliente.cpf,
        rg: rg ? encrypt(rg) : cliente.rg,
        imagemUrl,
        userId,
        apelido,
        observacao,
      },
    });

    return res.json({
      ...updated,
      cpf:
        updated.cpf && updated.cpf.includes(":")
          ? decrypt(updated.cpf)
          : updated.cpf,
      rg:
        updated.rg && updated.rg.includes(":")
          ? decrypt(updated.rg)
          : updated.rg,
    });
  } catch (error) {
    console.error("ERRO UPDATE CLIENTE:", error);
    return res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
}

/* =========================
   DELETE
========================= */

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