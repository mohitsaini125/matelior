import { api } from "./api";

export interface PaymentSession {
  paymentId?: string;
  sessionId?: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
  razorpayKeyId?: string;
  providerData?: Record<string, unknown>;
}

export interface PaymentVerificationPayload {
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  sessionId?: string;
  providerResult?: Record<string, unknown>;
}

export interface PaymentVerificationResult {
  payment: any;
  order: any;
}

export const paymentService = {
  async createSession(orderId: string): Promise<PaymentSession> {
    return api.post<PaymentSession>("/payments/session", { orderId });
  },

  async verify(payload: PaymentVerificationPayload): Promise<PaymentVerificationResult> {
    return api.post<PaymentVerificationResult>("/payments/verify", payload);
  },

  async getByOrderId(orderId: string): Promise<any> {
    return api.get<any>(`/payments/${orderId}`);
  },
};
