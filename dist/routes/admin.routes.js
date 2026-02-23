"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get("/dashboard", auth_middleware_1.auth, admin_middleware_1.isAdmin, (req, res) => {
    return res.json({ message: "Bem-vindo, Admin 😈" });
});
router.patch("/users/:id/unlock", auth_middleware_1.auth, admin_middleware_1.isAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await prisma_1.prisma.user.update({
        where: { id: id }, // ✅ CORRETO
        data: { status: "ATIVO" },
    });
    return res.json(user);
});
exports.default = router;
