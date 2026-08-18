import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/constants/colors";
import { formatPrice } from "@/utils/formatPrice";

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
}

export function CartSummary({ subtotal, discount = 0, shipping = 0, total }: CartSummaryProps) {
  return (
    <View style={styles.container}>
      <Row label="Subtotal" value={formatPrice(subtotal)} />
      {discount > 0 ? <Row label="Discount" value={`-${formatPrice(discount)}`} /> : null}
      <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
      <View style={styles.divider} />
      <Row label="Total" value={formatPrice(total)} emphasized />
    </View>
  );
}

function Row({ label, value, emphasized }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, emphasized && styles.emphasizedLabel]}>{label}</Text>
      <Text style={[styles.value, emphasized && styles.emphasizedValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  label: { ...typography.body, color: colors.secondaryText },
  value: { ...typography.body, color: colors.primaryText },
  emphasizedLabel: { ...typography.h3, color: colors.primaryText },
  emphasizedValue: { ...typography.h3, color: colors.primaryText },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
