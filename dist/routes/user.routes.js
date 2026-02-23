"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = __importDefault(require("../middlewares/upload"));
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.auth);
router.get("/me", user_controller_1.me);
router.put("/me", upload_1.default.single("imagem"), user_controller_1.updateMe);
router.delete("/me/imagem", user_controller_1.removeMyImage);
exports.default = router;
