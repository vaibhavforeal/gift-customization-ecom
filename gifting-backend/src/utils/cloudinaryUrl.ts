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
