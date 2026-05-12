// Admin product management: list (incl. inactive), create, update, delete,
// upload image. All routes here are mounted under /api/admin and protected
// by requireAdmin in routes/index.ts.

import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary";
import { prisma } from "../config/prisma";
import { upsertProductSchema } from "../validators/schemas";
import { env } from "../config/env";
import { buildImageVariants } from "../utils/cloudinaryUrl";

const router = Router();

// ---- Cloudinary-backed multer storage ----
// Files stream directly to Cloudinary — no local disk touched.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: env.cloudinaryFolder,
    // Strip extension for the public_id, Cloudinary handles format
    public_id: `${Date.now()}-${file.originalname
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase()}`,
    // Auto-optimize: pick best format (webp/avif) and quality
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

// POST /api/admin/products/upload-image
// Returns the public Cloudinary URL the admin can paste into the product form.
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded (field name: 'image')" });
    return;
  }
  // multer-storage-cloudinary puts the Cloudinary URL on req.file.path
  const file = req.file as Express.Multer.File & { path: string; filename: string };
  res.json({
    url: file.path,           // full https Cloudinary URL
    publicId: file.filename,  // Cloudinary public_id, useful for deletion later
    size: file.size,
  });
});

// GET /api/admin/products - includes inactive products
router.get("/", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        pricingTiers: { orderBy: { minQty: "asc" } },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    res.json({
      products: products.map((p) => ({
        ...p,
        images: buildImageVariants(p.imageUrl),
        pricingTiers: p.pricingTiers.map((t) => ({
          ...t,
          unitPrice: Number(t.unitPrice),
        })),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/products - create
router.post("/", async (req, res, next) => {
  try {
    const data = upsertProductSchema.parse(req.body);

    const created = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
        pricingTiers: {
          create: data.pricingTiers.map((t) => ({
            minQty: t.minQty,
            maxQty: t.maxQty ?? null,
            unitPrice: t.unitPrice,
          })),
        },
      },
      include: { pricingTiers: true },
    });

    res.status(201).json({ product: created });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:id - update (replaces pricing tiers entirely)
router.put("/:id", async (req, res, next) => {
  try {
    const data = upsertProductSchema.parse(req.body);

    const exists = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!exists) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Replace tiers atomically: delete old, create new.
    const updated = await prisma.$transaction(async (tx) => {
      await tx.pricingTier.deleteMany({
        where: { productId: req.params.id },
      });
      return tx.product.update({
        where: { id: req.params.id },
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          imageUrl: data.imageUrl,
          isActive: data.isActive ?? exists.isActive,
          pricingTiers: {
            create: data.pricingTiers.map((t) => ({
              minQty: t.minQty,
              maxQty: t.maxQty ?? null,
              unitPrice: t.unitPrice,
            })),
          },
        },
        include: { pricingTiers: true },
      });
    });

    res.json({ product: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id
// Soft-delete via isActive=false to preserve referential integrity with old orders.
router.delete("/:id", async (req, res, next) => {
  try {
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ product: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
