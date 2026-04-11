import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
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

/**
 * GET — dados do usuário logado
 */
export async function me(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        role: true,
        status: true,
        proximoPagamento: true,
        criadoEm: true,
        imagemUrl: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json({
      ...user,
      cpf:
        user.cpf && user.cpf.includes(":")
          ? decrypt(user.cpf)
          : user.cpf,
    });
  } catch (error) {
    console.error("ERRO ME:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
}

/**
 * PUT — atualizar dados do usuário logado
 */
export async function updateMe(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const {
      nome,
      email,
      cpf,
      proximoPagamento,
      senhaAtual,
      novaSenha,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const dataToUpdate: any = {};

    if (nome !== undefined) {
      dataToUpdate.nome = String(nome);
    }

    if (email !== undefined) {
      dataToUpdate.email = String(email);
    }

    // 🔐 CPF CRIPTOGRAFADO
    if (cpf !== undefined) {
      dataToUpdate.cpf = encrypt(String(cpf));
    }

    if (proximoPagamento !== undefined) {
      dataToUpdate.proximoPagamento = new Date(proximoPagamento);
    }

    // 🔥 IMAGEM
    if (req.file) {
      if (user.imagemUrl) {
        await deleteImageFromFirebase(user.imagemUrl);
      }

      const imagemUrl = await uploadImageToFirebase(req.file);
      dataToUpdate.imagemUrl = imagemUrl;
    }

    // 🔥 ALTERAÇÃO DE SENHA
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ error: "Senha atual é obrigatória" });
      }

      const senhaCorreta = await bcrypt.compare(
        senhaAtual,
        user.senha
      );

      if (!senhaCorreta) {
        return res.status(400).json({ error: "Senha atual incorreta" });
      }

      dataToUpdate.senha = await bcrypt.hash(novaSenha, 10);
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        role: true,
        status: true,
        proximoPagamento: true,
        criadoEm: true,
        imagemUrl: true,
      },
    });

    return res.json({
      ...updatedUser,
      cpf:
        updatedUser?.cpf && updatedUser.cpf.includes(":")
          ? decrypt(updatedUser.cpf)
          : updatedUser?.cpf,
    });
  } catch (error) {
    console.error("ERRO UPDATE ME:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
}

/**
 * DELETE IMAGE
 */
export async function removeMyImage(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.imagemUrl) {
      return res.status(400).json({ error: "Usuário não possui imagem" });
    }

    await deleteImageFromFirebase(user.imagemUrl);

    await prisma.user.update({
      where: { id: userId },
      data: { imagemUrl: null },
    });

    return res.json({ message: "Imagem removida com sucesso" });
  } catch (error) {
    console.error("ERRO REMOVE IMAGE:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
}