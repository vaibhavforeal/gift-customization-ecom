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
