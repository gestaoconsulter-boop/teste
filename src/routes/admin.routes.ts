import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/dashboard", auth, isAdmin, (req, res) => {
  return res.json({ message: "Bem-vindo, Admin 😈" });
});


router.patch(
  "/users/:id/unlock",
  auth,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: id as string }, // ✅ CORRETO
      data: { status: "ATIVO" },
    });

    return res.json(user);
  }
);

export default router;

