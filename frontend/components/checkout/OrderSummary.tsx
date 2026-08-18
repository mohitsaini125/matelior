import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/constants/colors";
import { CartItem } from "@/types/cart";
import { formatPrice } from "@/utils/formatPrice";
import { CartSummary } from "@/components/cart/CartSummary";

export function OrderSummary({
  items,
  subtotal,
  discount,
  shipping,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}) {
  return (
    <View>
      {items.map((item) => {
        const itemPrice = item.price ?? item.product?.price ?? 0;
        return (
          <View key={item._id} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.product?.name || "Product"} × {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>{formatPrice(itemPrice * item.quantity)}</Text>
          </View>
        );
      })}
      <View style={{ marginTop: spacing.md }}>
        <CartSummary subtotal={subtotal} discount={discount} shipping={shipping} total={total} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  itemName: { ...typography.bodySmall, color: colors.secondaryText, flex: 1, marginRight: spacing.sm },
  itemPrice: { ...typography.bodySmall, color: colors.primaryText },
});
