Done. Here's the helper and the route updates.

**1. Create `src/utils/cloudinaryUrl.ts`**

```typescript
// Cloudinary image transformation helper.
//
// Stored imageUrl format from Cloudinary:
//   https://res.cloudinary.com/<cloud>/image/upload/v1234/folder/file.jpg
//
// We insert transformation params right after /upload/ to get resized variants:
//   https://res.cloudinary.com/<cloud>/image/upload/w_600,h_600,c_fill,q_auto,f_auto/v1234/folder/file.jpg
//
// Transformation params used:
//   w_X, h_X   = width / height
//   c_fill     = crop to exact dimensions (good for thumbnails, cards)
//   c_limit    = scale down only, never up, no crop (good for hero)
//   q_auto     = automatic quality (smaller files, same perceived quality)
//   f_auto     = serve webp/avif to supporting browsers automatically
//
// If the URL is not a Cloudinary URL (seed data uses placehold.co, or admin
// pasted an external URL), the helper returns the original URL for every
// variant — frontend code stays the same regardless of image source.

const CLOUDINARY_URL_MARKER = "/image/upload/";

export interface ImageVariants {
  original: string;
  thumbnail: string; // 200x200 — admin tables, mini cart rows
  card: string;      // 600x600 — product cards in the carousel
  hero: string;      // 1200 wide — hero, product detail page
}

function applyTransform(url: string, transform: string): string {
  const idx = url.indexOf(CLOUDINARY_URL_MARKER);
  if (idx === -1) return url; // not a Cloudinary URL — return unchanged
  const before = url.slice(0, idx + CLOUDINARY_URL_MARKER.length);
  const after = url.slice(idx + CLOUDINARY_URL_MARKER.length);
  return `${before}${transform}/${after}`;
}

export function buildImageVariants(url: string): ImageVariants {
  return {
    original: url,
    thumbnail: applyTransform(url, "w_200,h_200,c_fill,q_auto,f_auto"),
    card: applyTransform(url, "w_600,h_600,c_fill,q_auto,f_auto"),
    hero: applyTransform(url, "w_1200,c_limit,q_auto,f_auto"),
  };
}
```

**2. Update `src/routes/products.ts`**

At the top, add:

```typescript
import { buildImageVariants } from "../utils/cloudinaryUrl";
```

In the list handler, replace the `out` mapping with:

```typescript
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
```

In the single product handler, replace `res.json({ product: ... })` with:

```typescript
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
```

**3. Update `src/routes/orders.ts`**

Add the import:

```typescript
import { buildImageVariants } from "../utils/cloudinaryUrl";
```

In `GET /api/orders/:id`, update the items mapping:

```typescript
items: order.items.map((it) => ({
  productName: it.product.name,
  imageUrl: it.product.imageUrl,
  images: buildImageVariants(it.product.imageUrl),
  quantity: it.quantity,
  unitPrice: Number(it.unitPrice),
  subtotal: Number(it.subtotal),
})),
```

**4. Update `src/routes/admin.products.ts`**

Add the import:

```typescript
import { buildImageVariants } from "../utils/cloudinaryUrl";
```

In the `GET /api/admin/products` list handler, update the response:

```typescript
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
```

**5. Update `src/routes/admin.orders.ts`**

Add the import:

```typescript
import { buildImageVariants } from "../utils/cloudinaryUrl";
```

In `GET /api/admin/orders/:id`, update the items mapping:

```typescript
items: order.items.map((it) => ({
  ...it,
  unitPrice: Number(it.unitPrice),
  subtotal: Number(it.subtotal),
  product: {
    ...it.product,
    images: buildImageVariants(it.product.imageUrl),
  },
})),
```

**How your frontend now uses it**

The API response for products now includes both `imageUrl` (original) and `images` (variants):

```json
{
  "products": [
    {
      "id": "ckxxx",
      "name": "Handcrafted Terracotta Diya Set",
      "imageUrl": "https://res.cloudinary.com/dxyz/image/upload/v1234/gifting-products/diya.jpg",
      "images": {
        "original": "https://res.cloudinary.com/dxyz/image/upload/v1234/gifting-products/diya.jpg",
        "thumbnail": "https://res.cloudinary.com/dxyz/image/upload/w_200,h_200,c_fill,q_auto,f_auto/v1234/gifting-products/diya.jpg",
        "card": "https://res.cloudinary.com/dxyz/image/upload/w_600,h_600,c_fill,q_auto,f_auto/v1234/gifting-products/diya.jpg",
        "hero": "https://res.cloudinary.com/dxyz/image/upload/w_1200,c_limit,q_auto,f_auto/v1234/gifting-products/diya.jpg"
      },
      "pricingTiers": [...]
    }
  ]
}
```

In your UI code:

```jsx
// Carousel cards
<img src={product.images.card} alt={product.name} />

// Mini cart row
<img src={product.images.thumbnail} alt={product.name} />

// Product detail / hero
<img src={product.images.hero} alt={product.name} />
```

`c_fill` crops square thumbnails and cards to exactly the requested dimensions (no awkward letterboxing). `c_limit` on the hero scales down for smaller screens but never upscales beyond the original, so hero images stay sharp.

The non-Cloudinary fallback matters because your seeded products use `placehold.co` URLs — for those, every variant just returns the original URL, so nothing breaks during development. The moment you replace seed images with real Cloudinary uploads via your admin form, the variants kick in automatically.