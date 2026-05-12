// Routes barrel. server.ts mounts this under /api.

import { Router } from "express";
import productsRouter from "./products";
import quoteRouter from "./quote";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import adminAuthRouter from "./admin.auth";
import adminProductsRouter from "./admin.products";
import adminOrdersRouter from "./admin.orders";
import adminStatsRouter from "./admin.stats";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Temporary setup endpoint — create admin without shell access.
// POST /api/setup-admin { setupKey, email, password, name }
// setupKey must match JWT_SECRET to prevent unauthorized use.
// DELETE THIS ROUTE after creating your admin account.
import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

// POST /api/setup-db — run prisma migrate deploy remotely
router.post("/setup-db", (req, res) => {
  try {
    const { setupKey } = req.body;
    if (!setupKey || setupKey !== env.jwtSecret) {
      res.status(403).json({ error: "Invalid setup key" });
      return;
    }
    const output = execSync("npx prisma migrate deploy", {
      encoding: "utf-8",
      timeout: 30000,
    });
    res.json({ message: "Migration complete", output });
  } catch (err: any) {
    res.status(500).json({ error: err.message, output: err.stdout || "" });
  }
});

router.post("/setup-admin", async (req, res) => {
  try {
    const { setupKey, email, password, name } = req.body;
    if (!setupKey || setupKey !== env.jwtSecret) {
      res.status(403).json({ error: "Invalid setup key" });
      return;
    }
    if (!email || !password || password.length < 8) {
      res.status(400).json({ error: "Email and password (min 8 chars) required" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { passwordHash, name: name || undefined },
      create: { email, passwordHash, name: name || null },
    });
    res.json({ message: `Admin ready: ${admin.email}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Public ----
router.use("/products", productsRouter);
router.use("/quote", quoteRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);

// ---- Admin ----
// /admin/login is unauthenticated (you need to log in to get a token).
router.use("/admin/auth", adminAuthRouter);
// Everything else under /admin/* requires a valid JWT.
router.use("/admin/products", requireAdmin, adminProductsRouter);
router.use("/admin/orders", requireAdmin, adminOrdersRouter);
router.use("/admin/stats", requireAdmin, adminStatsRouter);

export default router;
