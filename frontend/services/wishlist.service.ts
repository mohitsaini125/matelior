import { api } from "./api";
import { Product } from "@/types/product";

export const wishlistService = {
  async get(): Promise<Product[]> {
    return api.get<Product[]>("/wishlist");
  },

  async add(productId: string): Promise<Product[]> {
    return api.post<Product[]>("/wishlist", { productId });
  },

  async remove(productId: string): Promise<Product[]> {
    return api.delete<Product[]>(`/wishlist/${productId}`);
  },
};
