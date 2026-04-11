import admin from "firebase-admin";
import serviceAccount from "../../firebase-service-account.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  storageBucket: "teste-741d5.appspot.com",
});

export const bucket = admin.storage().bucket();
