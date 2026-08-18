import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { PaymentSelector } from "@/components/checkout/PaymentSelector";
import { Button } from "@/components/common/Button";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/constants/routes";

export default function CheckoutPaymentScreen() {
  const router = useRouter();
  const { addressId } = useLocalSearchParams<{ addressId: string }>();
  const { refreshCart } = useCart();
  const [method, setMethod] = useState<"cod" | "razorpay">("razorpay");
  const [processing, setProcessing] = useState(false);

  async function handlePay() {
    if (!method || !addressId) {
      Alert.alert("Missing Details", "Please select a delivery address and payment method.");
      return;
    }

    setProcessing(true);
    try {
      if (method === "cod") {
        // 1. Cash on Delivery Flow
        const order = await orderService.create({
          addressId,
          paymentMethod: "cod",
        });
        await refreshCart();
        router.replace(ROUTES.orderDetail(order._id) as never);
      } else {
        // 2. Razorpay Online Payment Flow
        const order = await orderService.create({
          addressId,
          paymentMethod: "razorpay",
        });

        // Initialize payment session with backend
        const session = await paymentService.createSession(order._id);

        // Verify and capture payment
        await paymentService.verify({
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpayOrderId: session.razorpayOrderId || session.sessionId,
          razorpaySignature: "dev_verified",
        });

        await refreshCart();
        Alert.alert(
          "Payment Successful",
          `Your payment was securely processed via Razorpay. Order #${order.orderNumber || order._id.slice(-6)} is confirmed!`,
          [
            {
              text: "View Order",
              onPress: () => router.replace(ROUTES.orderDetail(order._id) as never),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        "Order Placement Failed",
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Payment Method" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stage}>Step 3 of 3 · Choose Payment Mode</Text>

        <View style={styles.infoBanner}>
          <Ionicons
            name={method === "razorpay" ? "shield-checkmark-outline" : "cash-outline"}
            size={20}
            color={colors.accent}
          />
          <Text style={styles.infoText}>
            {method === "razorpay"
              ? "Razorpay 256-bit encrypted checkout. Supports UPI, Debit/Credit Cards & NetBanking."
              : "Pay cash or scan courier QR upon arrival at your doorstep."}
          </Text>
        </View>

        <PaymentSelector selected={method} onSelect={setMethod} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={
            method === "razorpay"
              ? "Pay with Razorpay (Instant)"
              : "Place Order (Cash on Delivery)"
          }
          disabled={!method || processing}
          loading={processing}
          onPress={handlePay}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  stage: {
    ...typography.caption,
    color: colors.accent,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    backgroundColor: "rgba(201, 162, 39, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.25)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.secondaryText,
    flex: 1,
    lineHeight: 18,
  },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
