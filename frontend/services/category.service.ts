import { api } from "./api";
import { Category } from "@/types/category";

export const categoryService = {
  async list(params?: { q?: string; sort?: string; order?: string }): Promise<Category[]> {
    return api.get<Category[]>("/categories", {
      params: params as Record<string, string | number | boolean | undefined>,
      authenticated: false,
    });
  },

  async getBySlug(slug: string): Promise<Category> {
    return api.get<Category>(`/categories/${slug}`, { authenticated: false });
  },

  async create(body: Partial<Category>): Promise<Category> {
    return api.post<Category>("/categories", body);
  },

  async update(id: string, body: Partial<Category>): Promise<Category> {
    return api.patch<Category>(`/categories/${id}`, body);
  },

  async remove(id: string): Promise<Category> {
    return api.delete<Category>(`/categories/${id}`);
  },
};
