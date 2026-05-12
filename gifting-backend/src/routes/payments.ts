// POST /api/payments/verify
// Called by the frontend after Razorpay Checkout succeeds.
// We verify the signature server-side and ONLY THEN mark the order PAID.

import { Router } from "express";
import { prisma } from "../config/prisma";
import { verifyPaymentSignature } from "../utils/razorpay";
import { verifyPaymentSchema } from "../validators/schemas";

const router = Router();

router.post("/verify", async (req, res, next) => {
  try {
    const data = verifyPaymentSchema.parse(req.body);

    const ok = verifyPaymentSignature({
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
    });

    if (!ok) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    // Find the internal order by Razorpay order id
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: data.razorpayOrderId },
    });
    if (!order) {
      res
        .status(404)
        .json({ error: "Order for this Razorpay payment not found" });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: data.razorpayPaymentId,
        // Auto-advance order status if it was just sitting in PENDING
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
      },
    });

    res.json({
      orderNumber: updated.orderNumber,
      paymentStatus: updated.paymentStatus,
      status: updated.status,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
