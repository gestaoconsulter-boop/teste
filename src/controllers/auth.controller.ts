import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { mailer } from "../services/mail";


// ================= REGISTER =================
export async function register(req: Request, res: Response) {
  try {
    const { nome, email, cpf, senha, role, proximoPagamento } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        cpf,
        senha: senhaHash,
        role,
        proximoPagamento: new Date(proximoPagamento),
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
}


// ================= LOGIN =================
export async function login(req: Request, res: Response) {
  try {
    const { login, senha } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ cpf: login }, { email: login }],
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        role: user.role,
        status: user.status,
        proximoPagamento: user.proximoPagamento,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}


// ================= FORGOT PASSWORD =================
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { login } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { cpf: login }],
      },
    });

    // 🔐 segurança: não revelar se usuário existe
    if (!user || !user.email) {
      return res.json({
        message: "Se a conta existir, enviaremos um código para o email.",
      });
    }

    // 🔥 token curto amigável
    const token = crypto.randomBytes(3).toString("hex").toUpperCase(); 
    // exemplo: A9F3B2

    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    await mailer.sendMail({
      from: `"App Consultor" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Recuperação de senha",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Recuperação de senha</h2>
          <p>Olá, ${user.nome}</p>
          <p>Seu código para redefinir a senha é:</p>
          <h1 style="letter-spacing: 5px; color: #2F74C0;">
            ${token}
          </h1>
          <p>Este código expira em 15 minutos.</p>
          <br/>
          <small>Se você não solicitou essa alteração, ignore este email.</small>
        </div>
      `,
    });

    return res.json({
      message: "Se a conta existir, enviaremos um código para o email.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao enviar email de recuperação" });
  }
}


// ================= RESET PASSWORD =================
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, novaSenha } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token.toUpperCase(),
        resetTokenExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Código inválido ou expirado" });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return res.json({ message: "Senha redefinida com sucesso" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao redefinir senha" });
  }
}
