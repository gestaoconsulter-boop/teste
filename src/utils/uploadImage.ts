import { bucket } from "../config/firebase";
import { v4 as uuidv4 } from "uuid";

export async function uploadImageToFirebase(file: Express.Multer.File) {
  try {
    if (!file) {
      throw new Error("Arquivo não recebido");
    }

    const fileName = `uploads/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // 🔥 GERA URL DIRETA SEM depender de makePublic
    const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return url;
  } catch (error) {
    console.error("ERRO FIREBASE UPLOAD:", error);
    throw error;
  }
}