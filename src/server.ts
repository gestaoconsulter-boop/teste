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

app.use(cors());
app.use(express.json());

// rotas
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/clientes", clienteRoutes); 
app.use("/consultores", consultorRoutes);
app.use(healthRoutes);
app.use("/users", userRoutes);

app.listen(3333, () => {
  console.log("🔥 Backend rodando em http://localhost:3333");
});



