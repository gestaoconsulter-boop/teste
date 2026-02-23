import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import upload from "../middlewares/upload";
import {
  getConsultorById,
  listConsultores,
  createConsultor,
  updateConsultor,
  deleteConsultor,
  listConsultoresBloqueados,
  updateStatusConsultor,
  listConsultoresParaTransferencia, // 👈 IMPORTA
} from "../controllers/consultor.controller";

const router = Router();

router.use(auth);

/* =========================
   ROTAS CONSULTOR (ANTES)
   ========================= */
router.get(
  "/transferencia",
  listConsultoresParaTransferencia
);

/* =========================
   ROTAS ADMIN
   ========================= */
router.use(isAdmin);

router.get("/", listConsultores);
router.get("/bloqueados", listConsultoresBloqueados);
router.post("/", createConsultor);
router.delete("/:id", deleteConsultor);
router.patch("/alterar-status/:consultorId", updateStatusConsultor);


/* =========================
   ROTAS COMUNS
   ========================= */
router.get("/:id", getConsultorById);
router.put("/:id", upload.single("imagem"), updateConsultor);

export default router;
