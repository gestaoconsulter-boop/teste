"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
const client_1 = require("@prisma/client");
function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== client_1.UserRole.ADMIN) {
        return res.status(403).json({ error: "Acesso negado" });
    }
    return next();
}
