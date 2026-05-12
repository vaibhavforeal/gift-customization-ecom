// All request body schemas live here. Each route imports the relevant one
// and calls schema.parse(req.body) — Zod throws on invalid input and our
// errorHandler converts that into a 400.

import { z } from "zod";

// ----- Public -----

export const quoteItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const quoteRequestSchema = z.object({
  items: z.array(quoteItemSchema).min(1),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1).max(120),
  customerPhone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[0-9+\-\s]+$/, "Invalid phone format"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  shippingAddress: z.string().min(5).max(1000),
  occasion: z.string().max(60).optional(),
  notes: z.string().max(500).optional(),
  items: z.array(quoteItemSchema).min(1),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

// ----- Admin auth -----

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ----- Admin product mgmt -----

export const pricingTierInputSchema = z.object({
  minQty: z.number().int().positive(),
  maxQty: z.number().int().positive().nullable().optional(),
  unitPrice: z.number().positive(),
});

export const upsertProductSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  category: z.enum(["TERRACOTTA", "SWEET", "DRYFRUIT", "OTHER"]),
  imageUrl: z.string().min(1),
  isActive: z.boolean().optional(),
  pricingTiers: z.array(pricingTierInputSchema).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "PACKED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
});
