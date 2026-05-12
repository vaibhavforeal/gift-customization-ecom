// Admin auth. Just login -> returns JWT.
// To create admin users: `npm run create:admin`

import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signAdminToken } from "../utils/jwt";
import { adminLoginSchema } from "../validators/schemas";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = adminLoginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      // Same response for "no user" vs "wrong password" so we don't leak which.
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signAdminToken({ adminId: admin.id, email: admin.email });

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
