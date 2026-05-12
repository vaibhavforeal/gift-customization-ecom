// POST /api/quote - given a list of products + quantities, compute the price.
// Use this for the running total on the "build your hamper" UI.
// The customer never sets the price; the server is authoritative.

import { Router } from "express";
import { buildQuote } from "../utils/pricing";
import { quoteRequestSchema } from "../validators/schemas";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const parsed = quoteRequestSchema.parse(req.body);
    const quote = await buildQuote(parsed.items);
    res.json(quote);
  } catch (err) {
    next(err);
  }
});

export default router;
