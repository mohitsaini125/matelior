import { api } from "./api";
import { PaginatedResponse, Product, ProductListParams } from "@/types/product";

export const productService = {
  async list(params: ProductListParams = {}): Promise<PaginatedResponse<Product>> {
    return api.get<PaginatedResponse<Product>>("/products", {
      params: params as Record<string, string | number | boolean | undefined>,
      authenticated: false,
    });
  },

  async getById(id: string): Promise<Product> {
    return api.get<Product>(`/products/${id}`, { authenticated: false });
  },

  async search(query: string, params: ProductListParams = {}): Promise<PaginatedResponse<Product>> {
    return productService.list({ ...params, q: query });
  },

  async create(body: Partial<Product>): Promise<Product> {
    return api.post<Product>("/products", body);
  },

  async update(id: string, body: Partial<Product>): Promise<Product> {
    return api.patch<Product>(`/products/${id}`, body);
  },

  async remove(id: string): Promise<Product> {
    return api.delete<Product>(`/products/${id}`);
  },
};
