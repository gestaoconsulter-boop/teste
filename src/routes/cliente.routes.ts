import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

import {
  createCliente,
  listClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
} from "../controllers/cliente.controller";

import { transferirCliente } from "../controllers/clienteTransfer.controller";

const router = Router();

/* =========================
   PROTEÇÃO
========================= */
router.use(auth);

/* =========================
   ROTAS CLIENTE
========================= */

// 🔥 Criar cliente (com upload de imagem)
router.post("/", upload.single("imagem"), createCliente);

// 🔥 Listar todos clientes
router.get("/", listClientes);

// 🔥 Buscar cliente por ID
router.get("/:id", getClienteById);

// 🔥 Atualizar cliente (com upload de imagem)
router.put("/:id", upload.single("imagem"), updateCliente);

// 🔥 Deletar cliente
router.delete("/:id", deleteCliente);

// 🔥 Transferir cliente para outro consultor
router.post("/:id/transferir", transferirCliente);

export default router;
