import { api } from "./api";
import { Review, ReviewInput } from "@/types/review";

export const reviewService = {
  async listForProduct(productId: string): Promise<Review[]> {
    return api.get<Review[]>(`/reviews/product/${productId}`, { authenticated: false });
  },

  async create(payload: ReviewInput): Promise<Review> {
    return api.post<Review>("/reviews", payload);
  },

  async update(id: string, payload: Partial<ReviewInput>): Promise<Review> {
    return api.patch<Review>(`/reviews/${id}`, payload);
  },

  async remove(id: string): Promise<void> {
    return api.delete<void>(`/reviews/${id}`);
  },
};
