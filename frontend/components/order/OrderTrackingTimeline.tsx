import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { Order } from "@/types/order";

const STAGES = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Order Confirmed" },
  { key: "packed", label: "Packed & Prepared" },
  { key: "out for delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_PROGRESS_MAP: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  "out for delivery": 3,
  delivered: 4,
};

export function OrderTrackingTimeline({ order }: { order: Order }) {
  const isCancelled = order.orderStatus === "cancelled";
  const isReturned = order.orderStatus === "returned";

  if (isCancelled || isReturned) {
    return (
      <View style={[styles.container, styles.statusBannerCancelled]}>
        <Ionicons name="alert-circle" size={24} color={colors.error} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cancelledTitle}>
            {isCancelled ? "Order Cancelled" : "Order Returned"}
          </Text>
          <Text style={styles.cancelledSub}>
            {order.cancellationInformation?.reason || order.returnInformation?.reason || "This order is no longer active."}
          </Text>
        </View>
      </View>
    );
  }

  const currentLevel = STATUS_PROGRESS_MAP[order.orderStatus] ?? 0;

  const timestamps: Record<string, string | undefined> = {
    placed: order.createdAt,
    confirmed: (order as any).confirmedAt || (currentLevel >= 1 ? order.createdAt : undefined),
    packed: (order as any).packedAt,
    "out for delivery": (order as any).outForDeliveryAt || (order as any).shippedAt,
    delivered: (order as any).deliveredAt,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.statusTitle}>
            {order.orderStatus === "pending"
              ? "Order Placed & Processing"
              : order.orderStatus === "confirmed"
              ? "Order Confirmed"
              : order.orderStatus === "packed"
              ? "Packed & Ready for Dispatch"
              : order.orderStatus === "shipped" || order.orderStatus === "out for delivery"
              ? "Out for Delivery · Courier on the Way"
              : "Delivered Successfully"}
          </Text>
          {(order as any).estimatedDeliveryDate ? (
            <Text style={styles.estimated}>
              Estimated Delivery:{" "}
              {new Date((order as any).estimatedDeliveryDate).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          ) : null}
        </View>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>{(order.orderStatus || "ACTIVE").toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {STAGES.map((s, index) => {
          const isCompleted = index <= currentLevel;
          const isCurrent = index === currentLevel;
          const isLast = index === STAGES.length - 1;

          return (
            <View key={s.key} style={styles.timelineStep}>
              <View style={styles.markerColumn}>
                <View
                  style={[
                    styles.marker,
                    isCompleted && styles.markerCompleted,
                    isCurrent && styles.markerCurrent,
                  ]}
                >
                  <Ionicons
                    name={isCompleted ? "checkmark" : "ellipse"}
                    size={isCompleted ? 14 : 8}
                    color={isCompleted ? colors.background : colors.mutedText}
                  />
                </View>
                {!isLast ? (
                  <View
                    style={[
                      styles.connector,
                      index < currentLevel && styles.connectorCompleted,
                    ]}
                  />
                ) : null}
              </View>

              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {s.label}
                </Text>
                {timestamps[s.key] ? (
                  <Text style={styles.timestamp}>
                    {new Date(timestamps[s.key] as string).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  statusBannerCancelled: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    borderColor: colors.error,
  },
  cancelledTitle: { ...typography.body, color: colors.error, fontWeight: "700" },
  cancelledSub: { ...typography.caption, color: colors.secondaryText, marginTop: 2 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  statusTitle: { ...typography.h3, color: colors.primaryText },
  estimated: { ...typography.caption, color: colors.accent, marginTop: 2, fontWeight: "600" },
  liveBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  liveText: { ...typography.caption, color: colors.accent, fontSize: 10, fontWeight: "700" },
  timeline: { paddingLeft: spacing.xs },
  timelineStep: { flexDirection: "row", minHeight: 48 },
  markerColumn: { alignItems: "center", width: 28 },
  marker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  markerCompleted: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  markerCurrent: {
    borderColor: colors.accent,
    borderWidth: 2,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  connectorCompleted: {
    backgroundColor: colors.accent,
  },
  stepContent: { flex: 1, marginLeft: spacing.sm, paddingBottom: spacing.sm },
  stepLabel: { ...typography.bodySmall, color: colors.mutedText },
  stepLabelCompleted: { color: colors.secondaryText },
  stepLabelCurrent: { color: colors.primaryText, fontWeight: "700" },
  timestamp: { ...typography.caption, color: colors.mutedText, fontSize: 11, marginTop: 1 },
});
