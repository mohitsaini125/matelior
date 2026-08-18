import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/common/Button";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { EmptyState } from "@/components/common/EmptyState";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/constants/routes";

// Checkout stage 1: order summary review. Backend recalculates all totals
// server-side at order-creation time — these are for display only.
export default function CheckoutSummaryScreen() {
  const router = useRouter();
  const { cart, isLoading } = useCart();

  if (isLoading && !cart) return <LoadingIndicator />;

  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Checkout" />
        <EmptyState title="Your cart is empty" />
      </View>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Checkout" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stage}>1. Order Summary</Text>
        <OrderSummary items={items} subtotal={subtotal} discount={0} shipping={0} total={subtotal} />
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Continue to Address" onPress={() => router.push(ROUTES.checkoutAddress as never)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  stage: { ...typography.h3, color: colors.secondaryText, marginBottom: spacing.md },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
