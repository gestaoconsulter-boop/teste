"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = me;
exports.updateMe = updateMe;
exports.removeMyImage = removeMyImage;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uploadImage_1 = require("../utils/uploadImage");
const deleteImage_1 = require("../utils/deleteImage");
/**
 * GET — dados do usuário logado
 */
async function me(req, res) {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
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
        if (!user)
            return res.status(404).json({ error: "Usuário não encontrado" });
        return res.json(user);
    }
    catch (error) {
        console.error("ERRO ME:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
}
/**
 * PUT — atualizar dados do usuário logado
 */
async function updateMe(req, res) {
    try {
        const userId = req.user.id;
        const { nome, senhaAtual, novaSenha } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        const dataToUpdate = {};
        if (nome !== undefined) {
            dataToUpdate.nome = String(nome);
        }
        // 🔥 SE VEIO IMAGEM NOVA
        if (req.file) {
            // 🔥 APAGA A ANTIGA PRIMEIRO
            if (user.imagemUrl) {
                await (0, deleteImage_1.deleteImageFromFirebase)(user.imagemUrl);
            }
            const imagemUrl = await (0, uploadImage_1.uploadImageToFirebase)(req.file);
            dataToUpdate.imagemUrl = imagemUrl;
        }
        if (novaSenha) {
            if (!senhaAtual) {
                return res.status(400).json({ error: "Senha atual é obrigatória" });
            }
            const senhaCorreta = await bcrypt_1.default.compare(senhaAtual, user.senha);
            if (!senhaCorreta) {
                return res.status(400).json({ error: "Senha atual incorreta" });
            }
            dataToUpdate.senha = await bcrypt_1.default.hash(novaSenha, 10);
        }
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
        });
        const updatedUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
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
        return res.json(updatedUser);
    }
    catch (error) {
        console.error("ERRO UPDATE ME:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
}
async function removeMyImage(req, res) {
    try {
        const userId = req.user.id;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.imagemUrl) {
            return res.status(400).json({ error: "Usuário não possui imagem" });
        }
        await (0, deleteImage_1.deleteImageFromFirebase)(user.imagemUrl);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { imagemUrl: null },
        });
        return res.json({ message: "Imagem removida com sucesso" });
    }
    catch (error) {
        console.error("ERRO REMOVE IMAGE:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
}
