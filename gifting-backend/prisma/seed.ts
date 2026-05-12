// Seed script: creates sample products so you can test the API immediately.
// Run with: npm run seed
// Safe to re-run - uses upsert by name where possible.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed] starting");

  const products: Array<{
    name: string;
    description: string;
    category: "TERRACOTTA" | "SWEET" | "DRYFRUIT" | "OTHER";
    imageUrl: string;
    tiers: Array<{ minQty: number; maxQty: number | null; unitPrice: number }>;
  }> = [
    {
      name: "Handcrafted Terracotta Diya Set (4 pcs)",
      description: "Set of 4 hand-painted terracotta diyas, made in Karnataka.",
      category: "TERRACOTTA",
      imageUrl: "https://placehold.co/600x600?text=Terracotta+Diya",
      tiers: [
        { minQty: 1, maxQty: 4, unitPrice: 250 },
        { minQty: 5, maxQty: 9, unitPrice: 220 },
        { minQty: 10, maxQty: null, unitPrice: 190 },
      ],
    },
    {
      name: "Mini Terracotta Ganesha Idol",
      description: "Eco-friendly mini Ganesha, 4 inches tall.",
      category: "TERRACOTTA",
      imageUrl: "https://placehold.co/600x600?text=Ganesha+Idol",
      tiers: [
        { minQty: 1, maxQty: 4, unitPrice: 180 },
        { minQty: 5, maxQty: null, unitPrice: 150 },
      ],
    },
    {
      name: "Kaju Katli 250g",
      description: "Premium cashew fudge, freshly made.",
      category: "SWEET",
      imageUrl: "https://placehold.co/600x600?text=Kaju+Katli",
      tiers: [
        { minQty: 1, maxQty: 9, unitPrice: 320 },
        { minQty: 10, maxQty: null, unitPrice: 290 },
      ],
    },
    {
      name: "Mysore Pak 200g",
      description: "Traditional Karnataka sweet, melt-in-the-mouth texture.",
      category: "SWEET",
      imageUrl: "https://placehold.co/600x600?text=Mysore+Pak",
      tiers: [
        { minQty: 1, maxQty: 9, unitPrice: 240 },
        { minQty: 10, maxQty: null, unitPrice: 210 },
      ],
    },
    {
      name: "Premium Almonds 100g",
      description: "California almonds, vacuum sealed.",
      category: "DRYFRUIT",
      imageUrl: "https://placehold.co/600x600?text=Almonds",
      tiers: [
        { minQty: 1, maxQty: 9, unitPrice: 180 },
        { minQty: 10, maxQty: null, unitPrice: 160 },
      ],
    },
    {
      name: "Cashews 100g",
      description: "W320 grade whole cashews.",
      category: "DRYFRUIT",
      imageUrl: "https://placehold.co/600x600?text=Cashews",
      tiers: [
        { minQty: 1, maxQty: 9, unitPrice: 220 },
        { minQty: 10, maxQty: null, unitPrice: 195 },
      ],
    },
    {
      name: "Mixed Dry Fruits 200g",
      description: "Almonds, cashews, raisins, pistachios, walnuts.",
      category: "DRYFRUIT",
      imageUrl: "https://placehold.co/600x600?text=Mixed+Dry+Fruits",
      tiers: [
        { minQty: 1, maxQty: 9, unitPrice: 420 },
        { minQty: 10, maxQty: null, unitPrice: 380 },
      ],
    },
  ];

  for (const p of products) {
    // Upsert by name (name isn't unique in schema, so do find+create/update)
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
      include: { pricingTiers: true },
    });

    if (existing) {
      // Replace pricing tiers
      await prisma.pricingTier.deleteMany({
        where: { productId: existing.id },
      });
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: p.description,
          category: p.category,
          imageUrl: p.imageUrl,
          isActive: true,
          pricingTiers: {
            create: p.tiers,
          },
        },
      });
      console.log(`[seed] updated: ${p.name}`);
    } else {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          category: p.category,
          imageUrl: p.imageUrl,
          isActive: true,
          pricingTiers: { create: p.tiers },
        },
      });
      console.log(`[seed] created: ${p.name}`);
    }
  }

  console.log("[seed] done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
