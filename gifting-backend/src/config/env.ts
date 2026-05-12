// Centralised environment variable loading and validation.
// Importing this module first thing in server.ts ensures we crash
// early if anything required is missing.

import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export const env = {
  port: parseInt(optional("PORT", "4000"), 10),
  nodeEnv: optional("NODE_ENV", "development"),
  frontendOrigin: optional("FRONTEND_ORIGIN", "http://localhost:5173"),

  databaseUrl: required("DATABASE_URL"),

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),

  razorpayKeyId: required("RAZORPAY_KEY_ID"),
  razorpayKeySecret: required("RAZORPAY_KEY_SECRET"),

  cloudinaryCloudName: required("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: required("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: required("CLOUDINARY_API_SECRET"),
  cloudinaryFolder: optional("CLOUDINARY_FOLDER", "kasturi-products"),
};
