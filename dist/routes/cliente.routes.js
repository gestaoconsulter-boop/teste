"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = __importDefault(require("../middlewares/upload"));
const cliente_controller_1 = require("../controllers/cliente.controller");
const clienteTransfer_controller_1 = require("../controllers/clienteTransfer.controller");
const router = (0, express_1.Router)();
/* =========================
   PROTEÇÃO
========================= */
router.use(auth_middleware_1.auth);
/* =========================
   ROTAS CLIENTE
========================= */
// 🔥 Criar cliente (com upload de imagem)
router.post("/", upload_1.default.single("imagem"), cliente_controller_1.createCliente);
// 🔥 Listar todos clientes
router.get("/", cliente_controller_1.listClientes);
// 🔥 Buscar cliente por ID
router.get("/:id", cliente_controller_1.getClienteById);
// 🔥 Atualizar cliente (com upload de imagem)
router.put("/:id", upload_1.default.single("imagem"), cliente_controller_1.updateCliente);
// 🔥 Deletar cliente
router.delete("/:id", cliente_controller_1.deleteCliente);
// 🔥 Transferir cliente para outro consultor
router.post("/:id/transferir", clienteTransfer_controller_1.transferirCliente);
exports.default = router;
