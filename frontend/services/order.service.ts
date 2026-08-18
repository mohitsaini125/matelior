import { api } from "./api";
import { Order, OrderStatus } from "@/types/order";
import { PaginatedResponse } from "@/types/product";

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: string;
}

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    return api.post<Order>("/orders", payload);
  },

  async list(page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    return api.get<PaginatedResponse<Order>>("/orders", { params: { page, limit } });
  },

  async listAdmin(page = 1, limit = 100): Promise<PaginatedResponse<Order>> {
    return api.get<PaginatedResponse<Order>>("/orders/admin", { params: { page, limit } });
  },

  async getById(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
  },

  async cancel(id: string, reason: string): Promise<Order> {
    return api.patch<Order>(`/orders/${id}/cancel`, { cancellationReason: reason, reason });
  },

  async requestReturn(id: string, reason: string): Promise<Order> {
    return api.patch<Order>(`/orders/${id}/return`, { returnReason: reason, reason });
  },

  async updateStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
    return api.patch(`/orders/admin/${orderId}/status`, { orderStatus });
  },

  async updateReturnStatus(orderId: string, status: string): Promise<Order> {
    return api.patch<Order>(`/orders/admin/${orderId}/return`, { status });
  },

  async updateRefundStatus(orderId: string): Promise<Order> {
    return api.patch<Order>(`/orders/admin/${orderId}/refund`, {});
  },
};
