import React, { createContext, useCallback, useEffect, useState } from "react";
import { cartService } from "@/services/cart.service";
import { Cart } from "@/types/cart";
import { AuthContext } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  isInCart: (productId: string) => boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const auth = React.useContext(AuthContext);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!auth?.isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cartService.get();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const isInCart = useCallback(
    (productId: string) => {
      if (!cart?.items) return false;
      return cart.items.some((i) => {
        const pId = typeof i.product === "object" && i.product ? (i.product as any)._id : i.product;
        return pId === productId;
      });
    },
    [cart]
  );

  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      const previous = cart;
      try {
        const updated = await cartService.addItem(productId, quantity);
        setCart(updated);
      } catch (err) {
        setCart(previous);
        throw err;
      }
    },
    [cart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const previous = cart;
      if (cart) {
        setCart({
          ...cart,
          items: cart.items.map((i) => (i._id === itemId ? { ...i, quantity } : i)),
        });
      }
      try {
        const updated = await cartService.updateQuantity(itemId, quantity);
        setCart(updated);
      } catch (err) {
        setCart(previous);
        throw err;
      }
    },
    [cart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const previous = cart;
      if (cart) {
        setCart({ ...cart, items: cart.items.filter((i) => i._id !== itemId) });
      }
      try {
        const updated = await cartService.removeItem(itemId);
        setCart(updated);
      } catch (err) {
        setCart(previous);
        throw err;
      }
    },
    [cart]
  );

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        isInCart,
        refreshCart,
        addItem,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
