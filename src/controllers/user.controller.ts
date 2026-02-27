import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { uploadImageToFirebase } from "../utils/uploadImage";
import { deleteImageFromFirebase } from "../utils/deleteImage";

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
        role: true,
        status: true,
        proximoPagamento: true,
        criadoEm: true,
        imagemUrl: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json(user);
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

    if (cpf !== undefined) {
      dataToUpdate.cpf = String(cpf);
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

    return res.json(updatedUser);
  } catch (error) {
    console.error("ERRO UPDATE ME:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
}


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
