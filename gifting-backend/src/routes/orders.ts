// Public order submission. Payment is OPTIONAL - an order can be saved
// as PENDING/UNPAID and the business can call/WhatsApp the customer later.

import { Router } from "express";
import { buildImageVariants } from "../utils/cloudinaryUrl";
import { prisma } from "../config/prisma";
import { buildQuote } from "../utils/pricing";
import { nextOrderNumber } from "../utils/orderNumber";
import { createOrderSchema } from "../validators/schemas";
import { env } from "../config/env";
import { createRazorpayOrder } from "../utils/razorpay";

const router = Router();

// POST /api/orders - submit a new order
router.post("/", async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);

    // Re-compute the quote server-side so the customer can't tamper with prices
    const quote = await buildQuote(data.items);

    // Generate order number outside the transaction (it does its own read)
    const orderNumber = await nextOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        shippingAddress: data.shippingAddress,
        occasion: data.occasion,
        notes: data.notes,
        subtotal: quote.subtotal,
        items: {
          create: quote.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal: Number(order.subtotal),
      itemCount: order.items.length,
      status: order.status,
      paymentStatus: order.paymentStatus,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id - public order status lookup (by order id).
// Returns minimal info so a customer can check their order without auth.
router.get("/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, imageUrl: true } },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      occasion: order.occasion,
      items: order.items.map((it) => ({
        productName: it.product.name,
        imageUrl: it.product.imageUrl,
        images: buildImageVariants(it.product.imageUrl),
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        subtotal: Number(it.subtotal),
      })),
      subtotal: Number(order.subtotal),
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/pay
// Creates a Razorpay Order for this internal order and returns the data
// the frontend needs to open Razorpay Checkout.
router.post("/:id/pay", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (order.paymentStatus === "PAID") {
      res.status(400).json({ error: "Order already paid" });
      return;
    }

    const rzpOrder = await createRazorpayOrder({
      amountInRupees: Number(order.subtotal),
      receipt: order.orderNumber,
      notes: { internalOrderId: order.id },
    });

    // Save the Razorpay order id so we can match it on the verify step
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    res.json({
      // Frontend passes these to Razorpay Checkout `options`
      razorpayKeyId: env.razorpayKeyId, // safe to expose (public)
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency,
      orderNumber: order.orderNumber,
      // Prefill helpers for Razorpay Checkout
      prefill: {
        name: order.customerName,
        email: order.customerEmail ?? "",
        contact: order.customerPhone,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
