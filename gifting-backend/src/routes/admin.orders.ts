// Admin order management: list with filters, get one, update status/payment.

import { Router } from "express";
import { prisma } from "../config/prisma";
import { updateOrderStatusSchema } from "../validators/schemas";
import { buildImageVariants } from "../utils/cloudinaryUrl";

const router = Router();

// GET /api/admin/orders?status=PENDING&paymentStatus=UNPAID&q=phone-or-name
// Pagination via ?page=1&pageSize=20 (defaults 1 / 20).
router.get("/", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const paymentStatus = req.query.paymentStatus as string | undefined;
    const q = (req.query.q as string | undefined)?.trim();
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt((req.query.pageSize as string) || "20", 10))
    );

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (q) {
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q } },
        { orderNumber: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: {
            select: { id: true, quantity: true, subtotal: true },
          },
        },
      }),
    ]);

    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        occasion: o.occasion,
        subtotal: Number(o.subtotal),
        itemCount: o.items.length,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders/:id - full details
router.get("/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, category: true },
            },
          },
        },
      },
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        items: order.items.map((it) => ({
          ...it,
          unitPrice: Number(it.unitPrice),
          subtotal: Number(it.subtotal),
          product: {
            ...it.product,
            images: buildImageVariants(it.product.imageUrl),
          },
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/orders/:id - update status and/or paymentStatus
router.patch("/:id", async (req, res, next) => {
  try {
    const data = updateOrderStatusSchema.parse(req.body);
    if (!data.status && !data.paymentStatus) {
      res.status(400).json({ error: "Nothing to update" });
      return;
    }
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data,
    });
    res.json({
      order: { ...updated, subtotal: Number(updated.subtotal) },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
