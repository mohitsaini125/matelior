import { Product } from "./product";

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}
