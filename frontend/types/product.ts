export type ProductStatus = "active" | "hidden" | "deleted";

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPercent: number;
  stock: number;
  sku: string;
  images: string[];
  material: string;
  color: string;
  tags: string[];
  status: ProductStatus;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  q?: string;
  category?: string;
  sort?: "price" | "newest" | "popularity" | "rating";
  order?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  color?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getDiscountedPrice(product: Product): number {
  if (!product.discountPercent) return product.price;
  return Math.round(product.price * (1 - product.discountPercent / 100));
}
