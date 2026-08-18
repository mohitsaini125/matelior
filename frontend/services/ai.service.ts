import { api } from "./api";

// Future AI-powered product visualization.
// Kept isolated from product/cart/order models so the provider can change freely.
export const aiService = {
  async visualize(productId: string, imageUri: string): Promise<{ resultUrl: string }> {
    return api.post<{ resultUrl: string }>("/ai/visualize", { productId, imageUri });
  },
};
