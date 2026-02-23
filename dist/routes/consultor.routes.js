"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const upload_1 = __importDefault(require("../middlewares/upload"));
const consultor_controller_1 = require("../controllers/consultor.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.auth);
/* =========================
   ROTAS CONSULTOR (ANTES)
   ========================= */
router.get("/transferencia", consultor_controller_1.listConsultoresParaTransferencia);
/* =========================
   ROTAS ADMIN
   ========================= */
router.use(admin_middleware_1.isAdmin);
router.get("/", consultor_controller_1.listConsultores);
router.get("/bloqueados", consultor_controller_1.listConsultoresBloqueados);
router.post("/", consultor_controller_1.createConsultor);
router.delete("/:id", consultor_controller_1.deleteConsultor);
router.patch("/alterar-status/:consultorId", consultor_controller_1.updateStatusConsultor);
/* =========================
   ROTAS COMUNS
   ========================= */
router.get("/:id", consultor_controller_1.getConsultorById);
router.put("/:id", upload_1.default.single("imagem"), consultor_controller_1.updateConsultor);
exports.default = router;
