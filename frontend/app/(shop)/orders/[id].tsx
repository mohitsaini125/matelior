import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { OrderTrackingTimeline } from "@/components/order/OrderTrackingTimeline";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { orderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { formatPrice } from "@/utils/formatPrice";

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    if (!id) return;
    setStatus("loading");
    orderService
      .getById(id)
      .then((data) => {
        setOrder(data);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load order");
        setStatus("error");
      });
  }

  useEffect(load, [id]);

  async function handleCancel() {
    if (!order || !reason.trim()) return;
    setSubmitting(true);
    try {
      const updated = await orderService.cancel(order._id, reason.trim());
      setOrder(updated);
      setCancelModalVisible(false);
      setReason("");
    } catch (err) {
      Alert.alert("Couldn't cancel order", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturn() {
    if (!order || !reason.trim()) return;
    setSubmitting(true);
    try {
      const updated = await orderService.requestReturn(order._id, reason.trim());
      setOrder(updated);
      setReturnModalVisible(false);
      setReason("");
    } catch (err) {
      Alert.alert("Couldn't request return", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return <LoadingIndicator />;
  if (status === "error" || !order) return <ErrorState message={error ?? "Order not found"} onRetry={load} />;

  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);
  const canReturn = order.orderStatus === "delivered" && !order.returnInformation;
  const itemsList = order.orderItems || order.items || [];
  const address = order.shippingAddress || ({} as any);
  const paymentMethod = (order as any).payment?.paymentMethod || "COD";
  const paymentStatus = (order as any).payment?.paymentStatus || order.paymentStatus || "PENDING";
  const total = order.totalAmount ?? order.subtotal ?? 0;
  const shippingCharge = (order as any).shippingCharge ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={`Order #${order.orderNumber || order._id.slice(-6)}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <OrderTrackingTimeline order={order} />

        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Purchased Items ({itemsList.length})</Text>
          {itemsList.map((item: any, idx: number) => {
            const name = item.productName || item.product?.name || "Product";
            const price = item.productPrice || item.price || 0;
            const qty = item.quantity || 1;
            return (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {name} × {qty}
                </Text>
                <Text style={styles.itemPrice}>{formatPrice(price * qty)}</Text>
              </View>
            );
          })}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.subText}>Shipping</Text>
            <Text style={styles.subText}>{shippingCharge > 0 ? formatPrice(shippingCharge) : "FREE"}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Delivery Details</Text>
          <Text style={styles.addressName}>{address.fullName || "Customer"}</Text>
          <Text style={styles.addressText}>
            {address.addressLine1}
            {address.addressLine2 ? `, ${address.addressLine2}` : ""}
          </Text>
          <Text style={styles.addressText}>
            {address.city}, {address.state} {address.postalCode || address.pincode || ""}
          </Text>
          {address.phone ? <Text style={styles.addressPhone}>Phone: {address.phone}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Payment Information</Text>
          <View style={styles.itemRow}>
            <Text style={styles.subText}>Method</Text>
            <Text style={styles.paymentMethodText}>
              {paymentMethod.toLowerCase() === "razorpay"
                ? "Razorpay (Online)"
                : "Cash on Delivery (COD)"}
            </Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.subText}>Payment Status</Text>
            <Text style={styles.paymentStatusText}>{paymentStatus.toUpperCase()}</Text>
          </View>
        </View>

        {order.cancellationInformation ? (
          <View style={[styles.card, styles.cardCancelled]}>
            <Text style={styles.cancelTitle}>Cancellation Details</Text>
            <Text style={styles.cancelReason}>{order.cancellationInformation.reason}</Text>
          </View>
        ) : null}

        {order.returnInformation ? (
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Return Status</Text>
            <Text style={styles.paymentStatusText}>{order.returnInformation.status.toUpperCase()}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {canCancel ? (
            <Button label="Cancel Order" variant="outline" onPress={() => setCancelModalVisible(true)} />
          ) : null}
          {canReturn ? (
            <Button label="Request Return" variant="outline" onPress={() => setReturnModalVisible(true)} />
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={cancelModalVisible} onClose={() => setCancelModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Cancel Order</Text>
          <Pressable onPress={() => setCancelModalVisible(false)} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>
        <Text style={styles.modalSub}>Please let us know the reason for cancellation:</Text>
        <Input placeholder="Tell us the reason" value={reason} onChangeText={setReason} multiline numberOfLines={3} />
        <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
          <Button label="Confirm Cancellation" onPress={handleCancel} loading={submitting} disabled={!reason.trim()} />
          <Button label="Keep Order" variant="ghost" onPress={() => setCancelModalVisible(false)} />
        </View>
      </Modal>

      <Modal visible={returnModalVisible} onClose={() => setReturnModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Request Return</Text>
          <Pressable onPress={() => setReturnModalVisible(false)} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>
        <Text style={styles.modalSub}>Please let us know the reason for returning this order:</Text>
        <Input placeholder="Tell us the reason" value={reason} onChangeText={setReason} multiline numberOfLines={3} />
        <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
          <Button label="Submit Return Request" onPress={handleReturn} loading={submitting} disabled={!reason.trim()} />
          <Button label="Cancel" variant="ghost" onPress={() => setReturnModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCancelled: {
    borderColor: colors.error,
    backgroundColor: "rgba(220, 53, 69, 0.08)",
  },
  cardHeaderTitle: {
    ...typography.caption,
    color: colors.accent,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  itemName: { ...typography.bodySmall, color: colors.primaryText, flex: 1, marginRight: spacing.sm },
  itemPrice: { ...typography.bodySmall, color: colors.primaryText, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  subText: { ...typography.bodySmall, color: colors.mutedText },
  totalLabel: { ...typography.body, color: colors.primaryText, fontWeight: "700" },
  totalPrice: { ...typography.h3, color: colors.accent, fontWeight: "700" },
  addressName: { ...typography.body, color: colors.primaryText, fontWeight: "600" },
  addressText: { ...typography.bodySmall, color: colors.secondaryText, marginTop: 1 },
  addressPhone: { ...typography.caption, color: colors.mutedText, marginTop: 2 },
  paymentMethodText: { ...typography.bodySmall, color: colors.primaryText, fontWeight: "600" },
  paymentStatusText: { ...typography.caption, color: colors.accent, fontWeight: "700" },
  cancelTitle: { ...typography.caption, color: colors.error, textTransform: "uppercase", fontWeight: "700" },
  cancelReason: { ...typography.bodySmall, color: colors.secondaryText, marginTop: 2 },
  actions: { marginTop: spacing.md, gap: spacing.sm, marginBottom: spacing.xl },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  modalTitle: { ...typography.h3, color: colors.primaryText },
  modalSub: { ...typography.bodySmall, color: colors.secondaryText, marginBottom: spacing.sm },
});
