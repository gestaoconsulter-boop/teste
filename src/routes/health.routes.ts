import { Router } from "express";

const healthRoutes = Router();

healthRoutes.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    server: "online",
    timestamp: new Date(),
  });
});

export default healthRoutes;
