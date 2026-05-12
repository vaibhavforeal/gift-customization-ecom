// Public products listing. Used by the carousel UI to render items.
// Returns only active products so admins can hide things without deleting.

import { Router } from "express";
import { prisma } from "../config/prisma";
import { buildImageVariants } from "../utils/cloudinaryUrl";

const router = Router();

// GET /api/products?category=TERRACOTTA
// category is optional. If absent, returns all active products.
router.get("/", async (req, res, next) => {
  try {
    const category = (req.query.category as string | undefined)?.toUpperCase();

    const where: any = { isActive: true };
    if (category && ["TERRACOTTA", "SWEET", "DRYFRUIT", "OTHER"].includes(category)) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        pricingTiers: {
          orderBy: { minQty: "asc" },
          select: { minQty: true, maxQty: true, unitPrice: true },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Convert Decimal -> number for JSON
    const out = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      imageUrl: p.imageUrl,
      images: buildImageVariants(p.imageUrl),
      pricingTiers: p.pricingTiers.map((t) => ({
        minQty: t.minQty,
        maxQty: t.maxQty,
        unitPrice: Number(t.unitPrice),
      })),
    }));

    res.json({ products: out });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id - single product details
router.get("/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        pricingTiers: { orderBy: { minQty: "asc" } },
      },
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({
      product: {
        ...product,
        images: buildImageVariants(product.imageUrl),
        pricingTiers: product.pricingTiers.map((t) => ({
          minQty: t.minQty,
          maxQty: t.maxQty,
          unitPrice: Number(t.unitPrice),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
