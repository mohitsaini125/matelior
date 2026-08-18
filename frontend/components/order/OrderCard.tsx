import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { Order } from "@/types/order";
import { formatPrice } from "@/utils/formatPrice";
import { ROUTES } from "@/constants/routes";

export function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const itemsCount = (order.orderItems || order.items || []).length;
  const total = order.totalAmount ?? order.subtotal ?? 0;

  return (
    <Pressable style={styles.card} onPress={() => router.push(ROUTES.orderDetail(order._id) as never)}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderNumber}>#{order.orderNumber || order._id.slice(-6)}</Text>
        <Text style={[styles.status, order.orderStatus === "delivered" && styles.statusDelivered]}>
          {(order.orderStatus || "PENDING").toUpperCase()}
        </Text>
      </View>
      <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.items}>{itemsCount} item(s)</Text>
      <Text style={styles.total}>{formatPrice(total)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  orderNumber: { ...typography.h3, color: colors.primaryText },
  status: { ...typography.caption, color: colors.accent, fontWeight: "700" },
  statusDelivered: { color: colors.success },
  date: { ...typography.bodySmall, color: colors.mutedText, marginBottom: 4 },
  items: { ...typography.bodySmall, color: colors.secondaryText, marginBottom: spacing.xs },
  total: { ...typography.price, color: colors.primaryText },
});
