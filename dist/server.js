"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const cliente_routes_1 = __importDefault(require("./routes/cliente.routes"));
const consultor_routes_1 = __importDefault(require("./routes/consultor.routes"));
const payment_job_1 = require("./jobs/payment.job");
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
(0, payment_job_1.checkPayments)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// rotas
app.use("/auth", auth_routes_1.default);
app.use("/admin", admin_routes_1.default);
app.use("/clientes", cliente_routes_1.default);
app.use("/consultores", consultor_routes_1.default);
app.use(health_routes_1.default);
app.use("/users", user_routes_1.default);
app.listen(3333, () => {
    console.log("🔥 Backend rodando em http://localhost:3333");
});
