import { bucket } from "../config/firebase";

export async function deleteImageFromFirebase(imageUrl: string) {
  try {
    if (!imageUrl) return;

    console.log("URL ORIGINAL:", imageUrl);

    // Remove domínio até depois do bucket
    const baseUrl = `https://storage.googleapis.com/${bucket.name}/`;
    let filePath = imageUrl.replace(baseUrl, "");

    // Decodifica caso tenha %2F
    filePath = decodeURIComponent(filePath);

    console.log("CAMINHO FINAL CORRETO:", filePath);

    await bucket.file(filePath).delete();

    console.log("✅ Imagem deletada com sucesso.");
  } catch (error: any) {
    console.error("❌ Erro ao deletar imagem:", error.message);
  }
}
