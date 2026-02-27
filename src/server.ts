import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import clienteRoutes from "./routes/cliente.routes";
import consultorRoutes from "./routes/consultor.routes";
import { checkPayments } from "./jobs/payment.job";
import healthRoutes from "./routes/health.routes";
import userRoutes from "./routes/user.routes";

checkPayments();

const app = express();

/* =========================
   CONFIGURAÇÕES GERAIS
========================= */

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROTAS
========================= */

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/clientes", clienteRoutes);
app.use("/consultores", consultorRoutes);
app.use("/users", userRoutes);
app.use(healthRoutes);

/* =========================
   PORTA DINÂMICA (RENDER)
========================= */

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🔥 Backend rodando na porta ${PORT}`);
});