// Server-side pricing logic. The customer never sets price; we always
// compute it from the product's PricingTier rows so the price cannot
// be tampered with from the frontend.

import { prisma } from "../config/prisma";

export interface QuoteRequestItem {
  productId: string;
  quantity: number;
}

export interface QuoteLineItem {
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quote {
  items: QuoteLineItem[];
  subtotal: number;
}

/**
 * Pick the unit price for a given quantity from the product's tiers.
 * Tiers are evaluated as: minQty <= qty <= maxQty (maxQty=null is "infinity").
 * If no tier matches, falls back to the highest tier's price.
 */
function pickUnitPrice(
  tiers: Array<{ minQty: number; maxQty: number | null; unitPrice: any }>,
  quantity: number
): number {
  if (tiers.length === 0) {
    throw new Error("Product has no pricing tiers configured");
  }
  // Sort ascending by minQty so we can scan
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  for (const t of sorted) {
    const min = t.minQty;
    const max = t.maxQty ?? Number.POSITIVE_INFINITY;
    if (quantity >= min && quantity <= max) {
      return Number(t.unitPrice);
    }
  }
  // Fallback: use the last tier's price (covers very large quantities
  // when the top tier was specified with a maxQty by mistake).
  return Number(sorted[sorted.length - 1].unitPrice);
}

/**
 * Build a full quote for a list of {productId, quantity}.
 * Throws if a product is missing, inactive, or quantity invalid.
 */
export async function buildQuote(
  requestItems: QuoteRequestItem[]
): Promise<Quote> {
  if (requestItems.length === 0) {
    throw new Error("Quote must contain at least one item");
  }

  // Deduplicate productIds in case the customer added the same product twice
  // - we merge quantities.
  const mergedMap = new Map<string, number>();
  for (const it of requestItems) {
    if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
      throw new Error(`Invalid quantity for product ${it.productId}`);
    }
    mergedMap.set(
      it.productId,
      (mergedMap.get(it.productId) ?? 0) + it.quantity
    );
  }

  const productIds = Array.from(mergedMap.keys());
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { pricingTiers: true },
  });

  if (products.length !== productIds.length) {
    const found = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id) => !found.has(id));
    throw new Error(`Products not found or inactive: ${missing.join(", ")}`);
  }

  const lineItems: QuoteLineItem[] = products.map((p) => {
    const qty = mergedMap.get(p.id)!;
    const unitPrice = pickUnitPrice(p.pricingTiers, qty);
    return {
      productId: p.id,
      productName: p.name,
      imageUrl: p.imageUrl,
      quantity: qty,
      unitPrice,
      subtotal: +(unitPrice * qty).toFixed(2),
    };
  });

  const subtotal = +lineItems.reduce((s, l) => s + l.subtotal, 0).toFixed(2);

  return { items: lineItems, subtotal };
}
