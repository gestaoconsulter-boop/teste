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

    await fileUpload.makePublic();

    return fileUpload.publicUrl();
  } catch (error) {
    console.error("ERRO FIREBASE UPLOAD:", error);
    throw error;
  }
}
