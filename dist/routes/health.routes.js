"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthRoutes = (0, express_1.Router)();
healthRoutes.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        server: "online",
        timestamp: new Date(),
    });
});
exports.default = healthRoutes;
