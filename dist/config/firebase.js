"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_service_account_json_1 = __importDefault(require("../../firebase-service-account.json"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(firebase_service_account_json_1.default),
    storageBucket: "gs://teste-741d5.firebasestorage.app",
});
exports.bucket = firebase_admin_1.default.storage().bucket();
