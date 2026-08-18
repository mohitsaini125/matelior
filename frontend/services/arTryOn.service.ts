// Future AR try-on module. Stubbed intentionally — no camera/AR logic
// should leak into ProductCard, ProductModel, OrderModel, or CartModel.
export const arTryOnService = {
  isSupported(): boolean {
    return false;
  },
};
