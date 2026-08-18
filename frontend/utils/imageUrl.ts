// Luxury curated fallback imagery for MATELIOR products & categories
const CATEGORY_FALLBACKS: Record<string, string> = {
  wallet: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
  wallets: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
  belt: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
  belts: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
  ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
  glasses: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
  sunglasses: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
  pendant: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
  pendants: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
  passport: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
  covers: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
};

const DEFAULT_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800";
const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";

export function isValidHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

export function resolveCategoryImageUrl(category?: { name?: string; slug?: string; image?: string } | null): string {
  if (category?.image && isValidHttpUrl(category.image)) {
    return category.image;
  }
  const key = (category?.slug || category?.name || "").toLowerCase().trim();
  for (const [k, fallback] of Object.entries(CATEGORY_FALLBACKS)) {
    if (key.includes(k)) return fallback;
  }
  return DEFAULT_CATEGORY_IMAGE;
}

export function resolveProductImageUrl(product?: { name?: string; category?: any; images?: string[] } | null, index = 0): string {
  const img = product?.images?.[index] || product?.images?.[0];
  if (img && isValidHttpUrl(img)) {
    return img;
  }
  const name = (product?.name || "").toLowerCase();
  for (const [k, fallback] of Object.entries(CATEGORY_FALLBACKS)) {
    if (name.includes(k)) return fallback;
  }
  return DEFAULT_PRODUCT_IMAGE;
}
