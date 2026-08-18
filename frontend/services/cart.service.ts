import { api } from "./api";
import { Cart } from "@/types/cart";

export const cartService = {
  async get(): Promise<Cart> {
    return api.get<Cart>("/cart");
  },

  async addItem(productId: string, quantity: number): Promise<Cart> {
    return api.post<Cart>("/cart", { productId, quantity });
  },

  async updateQuantity(itemId: string, quantity: number): Promise<Cart> {
    return api.patch<Cart>(`/cart/${itemId}`, { quantity });
  },

  async removeItem(itemId: string): Promise<Cart> {
    return api.delete<Cart>(`/cart/${itemId}`);
  },
};
