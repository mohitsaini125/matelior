import React from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function WishlistScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { isAuthenticated } = useAuth();
  const { wishlist, isLoading } = useWishlist();

  const handleBack = () => {
    if (from === "profile") {
      router.replace(ROUTES.profile as never);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.home as never);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Wishlist"
        showBack={from === "profile"}
        onBack={handleBack}
      />
      {!isAuthenticated ? (
        <EmptyState
          title="Log in to view your wishlist"
          actionLabel="Log In"
          onAction={() => router.push(ROUTES.login as never)}
        />
      ) : isLoading ? (
        <LoadingIndicator fullscreen={false} />
      ) : wishlist.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          message="Save products you'll want later."
          actionLabel="Continue Shopping"
          onAction={() => router.push(ROUTES.home as never)}
        />
      ) : (
        <ProductGrid products={wishlist} />
      )}
    </View>
  );
}
