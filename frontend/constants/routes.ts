export const ROUTES = {
  // Main Tab Navigation
  home: "/(shop)" as const,
  categories: "/(shop)/categories" as const,
  wishlist: "/(shop)/wishlist" as const,
  cart: "/(shop)/cart" as const,
  profile: "/(shop)/profile" as const,

  // Detail & Action Screens (Pushed over Tabs)
  category: (slug: string) => `/(shop)/category/${slug}` as const,
  product: (id: string) => `/(shop)/product/${id}` as const,
  search: "/(shop)/search" as const,

  // Checkout Flow
  checkout: "/(shop)/checkout" as const,
  checkoutAddress: "/(shop)/checkout/address" as const,
  checkoutPayment: "/(shop)/checkout/payment" as const,

  // Order Management
  orders: "/(shop)/orders" as const,
  orderDetail: (id: string) => `/(shop)/orders/${id}` as const,

  // Profile Management
  addresses: "/(shop)/profile/addresses" as const,
  editProfile: "/(shop)/profile/edit" as const,

  // Auth Flow
  login: "/(auth)/login" as const,
  register: "/(auth)/register" as const,
  forgotPassword: "/(auth)/forgot-password" as const,

  // Admin Flow
  admin: "/(admin)" as const,
  adminProducts: "/(admin)/products" as const,
  adminCategories: "/(admin)/categories" as const,
  adminOrders: "/(admin)/orders" as const,
  adminUsers: "/(admin)/users" as const,
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
