import React, { createContext, useCallback, useEffect, useState } from "react";
import { wishlistService } from "@/services/wishlist.service";
import { Product } from "@/types/product";
import { AuthContext } from "./AuthContext";

interface WishlistContextValue {
  wishlist: Product[];
  isLoading: boolean;
  itemCount: number;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const auth = React.useContext(AuthContext);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!auth?.isAuthenticated) {
      setWishlist([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await wishlistService.get();
      setWishlist(Array.isArray(data) ? data : []);
    } catch {
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isWishlisted = useCallback(
    (productId: string) =>
      wishlist.some(
        (p) => (p && p._id === productId) || (typeof p === "string" && p === productId)
      ),
    [wishlist]
  );

  const toggle = useCallback(
    async (productId: string) => {
      const previous = wishlist;
      const currentlyWishlisted = isWishlisted(productId);
      try {
        const updated = currentlyWishlisted
          ? await wishlistService.remove(productId)
          : await wishlistService.add(productId);
        setWishlist(Array.isArray(updated) ? updated : []);
      } catch (err) {
        setWishlist(previous);
        throw err;
      }
    },
    [wishlist, isWishlisted]
  );

  const itemCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{ wishlist, isLoading, itemCount, isWishlisted, toggle, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
