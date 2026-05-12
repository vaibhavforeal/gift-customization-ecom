// Razorpay integration helpers.
//
// Flow:
//   1. Customer submits order  -> we create a row in DB with paymentStatus=UNPAID
//   2. Customer chooses to pay -> we call createRazorpayOrder() and return
//      the razorpay_order_id + public key to the frontend.
//   3. Frontend opens Razorpay Checkout. On success it sends us
//      razorpay_order_id, razorpay_payment_id, razorpay_signature.
//   4. We verify the signature server-side via verifyPaymentSignature().
//      Only then do we mark the order PAID. NEVER trust the frontend alone.

import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../config/env";

export const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});

/**
 * Create a Razorpay order. Amount must be in PAISE (₹1 = 100 paise).
 */
export async function createRazorpayOrder(opts: {
  amountInRupees: number;
  receipt: string; // your internal orderNumber
  notes?: Record<string, string>;
}) {
  return razorpay.orders.create({
    amount: Math.round(opts.amountInRupees * 100), // -> paise
    currency: "INR",
    receipt: opts.receipt,
    notes: opts.notes,
  });
}

/**
 * Verify the signature returned by Razorpay Checkout.
 * Signature = HMAC_SHA256(orderId + "|" + paymentId, keySecret).
 * Returns true if valid.
 */
export function verifyPaymentSignature(opts: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${opts.razorpayOrderId}|${opts.razorpayPaymentId}`)
    .digest("hex");

  // Use timingSafeEqual to avoid timing attacks
  const a = Buffer.from(expected);
  const b = Buffer.from(opts.razorpaySignature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
