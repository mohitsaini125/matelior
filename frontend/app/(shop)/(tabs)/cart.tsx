import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/common/Button";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { EmptyState } from "@/components/common/EmptyState";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";

export default function CartScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, isLoading } = useCart();

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Cart" showBack={false} />
        <EmptyState
          title="Log in to view your cart"
          actionLabel="Log In"
          onAction={() => router.push(ROUTES.login as never)}
        />
      </View>
    );
  }

  if (isLoading && !cart) return <LoadingIndicator />;

  const items = cart?.items ?? [];
  const hasOutOfStock = items.some((i) => i.product.stock === 0);
  const hasInsufficientStock = items.some((i) => i.quantity > i.product.stock);

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Cart" showBack={false} />
        <EmptyState
          title="Your cart is empty"
          message="Add something you'll love."
          actionLabel="Continue Shopping"
          onAction={() => router.push(ROUTES.home as never)}
        />
      </View>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Cart" showBack={false} />
      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <CartItemRow item={item} />}
      />
      <View style={styles.footer}>
        <CartSummary subtotal={subtotal} total={subtotal} />
        <Button
          label="Checkout"
          onPress={() => router.push(ROUTES.checkout as never)}
          disabled={hasOutOfStock || hasInsufficientStock}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
