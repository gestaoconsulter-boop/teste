"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsultor = createConsultor;
exports.listConsultores = listConsultores;
exports.updateConsultor = updateConsultor;
exports.deleteConsultor = deleteConsultor;
exports.listConsultoresBloqueados = listConsultoresBloqueados;
exports.listConsultoresParaTransferencia = listConsultoresParaTransferencia;
exports.getConsultorById = getConsultorById;
exports.updateStatusConsultor = updateStatusConsultor;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const uploadImage_1 = require("../utils/uploadImage");
/**
 * CREATE — ADMIN cria consultor
 */
async function createConsultor(req, res) {
    const loggedUser = req.user;
    if (loggedUser.role !== client_1.UserRole.ADMIN) {
        return res.status(403).json({ error: "Acesso negado" });
    }
    try {
        const { nome, email, cpf, senha, proximoPagamento } = req.body;
        let imagemUrl;
        if (req.file) {
            imagemUrl = await (0, uploadImage_1.uploadImageToFirebase)(req.file);
        }
        const senhaHash = await bcrypt_1.default.hash(senha, 10);
        const consultor = await prisma_1.prisma.user.create({
            data: {
                nome,
                email,
                cpf,
                senha: senhaHash,
                role: client_1.UserRole.CONSULTOR,
                proximoPagamento: new Date(proximoPagamento),
                imagemUrl,
            },
        });
        return res.status(201).json(consultor);
    }
    catch (error) {
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
async function listConsultores(req, res) {
    const consultores = await prisma_1.prisma.user.findMany({
        where: { role: client_1.UserRole.CONSULTOR },
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
async function updateConsultor(req, res) {
    const loggedUser = req.user;
    const { id } = req.params;
    const { nome, email, cpf, proximoPagamento, status } = req.body;
    const consultor = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!consultor || consultor.role !== client_1.UserRole.CONSULTOR) {
        return res.status(404).json({ error: "Consultor não encontrado" });
    }
    if (loggedUser.role === client_1.UserRole.CONSULTOR && loggedUser.id !== consultor.id) {
        return res.status(403).json({ error: "Acesso negado" });
    }
    let imagemUrl;
    if (req.file) {
        imagemUrl = await (0, uploadImage_1.uploadImageToFirebase)(req.file);
    }
    const data = {};
    if (nome !== undefined)
        data.nome = nome;
    if (email !== undefined)
        data.email = email;
    if (cpf !== undefined)
        data.cpf = cpf;
    if (imagemUrl !== undefined)
        data.imagemUrl = imagemUrl;
    if (proximoPagamento && loggedUser.role === client_1.UserRole.ADMIN) {
        data.proximoPagamento = new Date(proximoPagamento);
    }
    if (status && loggedUser.role === client_1.UserRole.ADMIN) {
        data.status = status;
    }
    const updated = await prisma_1.prisma.user.update({
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
async function deleteConsultor(req, res) {
    const loggedUser = req.user;
    if (loggedUser.role !== client_1.UserRole.ADMIN)
        return res.status(403).json({ error: "Acesso negado" });
    const { id } = req.params;
    const consultor = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!consultor || consultor.role !== client_1.UserRole.CONSULTOR) {
        return res.status(404).json({ error: "Consultor não encontrado" });
    }
    await prisma_1.prisma.user.delete({ where: { id } });
    return res.status(204).send();
}
/**
 * LIST — listar consultores BLOQUEADOS
 */
async function listConsultoresBloqueados(req, res) {
    const consultores = await prisma_1.prisma.user.findMany({
        where: {
            role: client_1.UserRole.CONSULTOR,
            status: client_1.AccountStatus.BLOQUEADO,
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
async function listConsultoresParaTransferencia(req, res) {
    const loggedUser = req.user;
    if (loggedUser.role !== client_1.UserRole.CONSULTOR)
        return res.status(403).json({ error: "Sem permissão" });
    const consultores = await prisma_1.prisma.user.findMany({
        where: {
            role: client_1.UserRole.CONSULTOR,
            status: client_1.AccountStatus.ATIVO,
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
async function getConsultorById(req, res) {
    const { id } = req.params;
    const consultor = await prisma_1.prisma.user.findFirst({
        where: { id, role: client_1.UserRole.CONSULTOR },
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
async function updateStatusConsultor(req, res) {
    const loggedUser = req.user;
    const { consultorId } = req.params;
    const { status } = req.body;
    if (loggedUser.role !== client_1.UserRole.ADMIN)
        return res.status(403).json({ error: "Acesso negado" });
    if (!Object.values(client_1.AccountStatus).includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
    }
    try {
        const consultor = await prisma_1.prisma.user.update({
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
    }
    catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ error: "Consultor não encontrado" });
        return res.status(400).json({
            error: "Erro ao atualizar status do consultor",
            details: error.message,
        });
    }
}
