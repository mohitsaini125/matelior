export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out for delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "picked"
  | "picked_up"
  | "received"
  | "refunded"
  | "completed";

export interface OrderItem {
  _id?: string;
  product: string | any;
  productId?: string;
  productName: string;
  productImage?: string;
  image?: string;
  productPrice?: number;
  price?: number;
  quantity: number;
}

export interface CancellationInformation {
  reason: string;
  cancelledBy: "user" | "admin";
  cancelledAt: string;
}

export interface ReturnInformation {
  reason: string;
  status: ReturnStatus;
  requestedAt: string;
  approvedAt?: string;
  pickedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
}

export interface RefundInformation {
  status: "processing" | "refunded";
  initiatedAt?: string;
  completedAt?: string;
}

export interface OrderPayment {
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  paymentGateway?: string | null;
  paidAt?: string | null;
}

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  pincode?: string;
  country: string;
}

export interface OrderDiscount {
  discountPercent?: number;
  discountAmount?: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | any;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  shippingAddress: OrderShippingAddress;
  payment?: OrderPayment;
  paymentStatus?: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal?: number;
  subTotal?: number;
  discount?: number | OrderDiscount;
  shippingCharge: number;
  totalAmount: number;
  confirmedAt?: string | null;
  packedAt?: string | null;
  shippedAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
  estimatedDeliveryDate?: string | null;
  cancellationInformation?: CancellationInformation;
  returnInformation?: ReturnInformation;
  refundInformation?: RefundInformation;
  createdAt: string;
  updatedAt: string;
}
