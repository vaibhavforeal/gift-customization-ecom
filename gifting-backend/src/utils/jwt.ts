// JWT helpers for admin authentication.
// We keep the payload tiny: just the admin id and email.

import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AdminTokenPayload {
  adminId: string;
  email: string;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
}
