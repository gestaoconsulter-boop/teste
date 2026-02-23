"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageFromFirebase = deleteImageFromFirebase;
const firebase_1 = require("../config/firebase");
async function deleteImageFromFirebase(imageUrl) {
    try {
        if (!imageUrl)
            return;
        console.log("URL ORIGINAL:", imageUrl);
        // Remove domínio até depois do bucket
        const baseUrl = `https://storage.googleapis.com/${firebase_1.bucket.name}/`;
        let filePath = imageUrl.replace(baseUrl, "");
        // Decodifica caso tenha %2F
        filePath = decodeURIComponent(filePath);
        console.log("CAMINHO FINAL CORRETO:", filePath);
        await firebase_1.bucket.file(filePath).delete();
        console.log("✅ Imagem deletada com sucesso.");
    }
    catch (error) {
        console.error("❌ Erro ao deletar imagem:", error.message);
    }
}
