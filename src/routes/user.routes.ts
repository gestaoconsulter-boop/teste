import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";
import { me, updateMe, removeMyImage } from "../controllers/user.controller";

const router = Router();

router.use(auth);

router.get("/me", me);

router.put(
  "/me",
  upload.single("imagem"),
  updateMe
);

router.delete("/me/imagem", removeMyImage);

export default router;


