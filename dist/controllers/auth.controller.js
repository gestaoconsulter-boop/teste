"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const mail_1 = require("../services/mail");
// ================= REGISTER =================
async function register(req, res) {
    try {
        const { nome, email, cpf, senha, role, proximoPagamento } = req.body;
        const senhaHash = await bcrypt_1.default.hash(senha, 10);
        const user = await prisma_1.prisma.user.create({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao registrar usuário" });
    }
}
// ================= LOGIN =================
async function login(req, res) {
    try {
        const { login, senha } = req.body;
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ cpf: login }, { email: login }],
            },
        });
        if (!user) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }
        const senhaValida = await bcrypt_1.default.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: "Senha inválida" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao fazer login" });
    }
}
// ================= FORGOT PASSWORD =================
async function forgotPassword(req, res) {
    try {
        const { login } = req.body;
        const user = await prisma_1.prisma.user.findFirst({
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
        const token = crypto_1.default.randomBytes(3).toString("hex").toUpperCase();
        // exemplo: A9F3B2
        const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpires: expires,
            },
        });
        await mail_1.mailer.sendMail({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao enviar email de recuperação" });
    }
}
// ================= RESET PASSWORD =================
async function resetPassword(req, res) {
    try {
        const { token, novaSenha } = req.body;
        const user = await prisma_1.prisma.user.findFirst({
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
        const senhaHash = await bcrypt_1.default.hash(novaSenha, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                senha: senhaHash,
                resetToken: null,
                resetTokenExpires: null,
            },
        });
        return res.json({ message: "Senha redefinida com sucesso" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao redefinir senha" });
    }
}
