import { Order } from "./order";

export type UserRole = "customer" | "admin" | "user";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserAnalytics {
  totalOrders: number;
  totalSpend: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  pendingOrders: number;
  lastOrderDate: string | null;
}

export interface UserActivityResponse {
  user: User;
  orders: Order[];
  addresses: any[];
  analytics: UserAnalytics;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
