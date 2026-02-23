"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToFirebase = uploadImageToFirebase;
const firebase_1 = require("../config/firebase");
const uuid_1 = require("uuid");
async function uploadImageToFirebase(file) {
    try {
        if (!file) {
            throw new Error("Arquivo não recebido");
        }
        const fileName = `uploads/${(0, uuid_1.v4)()}-${file.originalname}`;
        const fileUpload = firebase_1.bucket.file(fileName);
        await fileUpload.save(file.buffer, {
            metadata: {
                contentType: file.mimetype,
            },
        });
        await fileUpload.makePublic();
        return fileUpload.publicUrl();
    }
    catch (error) {
        console.error("ERRO FIREBASE UPLOAD:", error);
        throw error;
    }
}
