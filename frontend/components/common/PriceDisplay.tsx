import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/constants/colors";
import { formatPrice } from "@/utils/formatPrice";
import { getDiscountedPrice, Product } from "@/types/product";

export function PriceDisplay({ product }: { product: Product }) {
  const hasDiscount = product.discountPercent > 0;
  const finalPrice = getDiscountedPrice(product);

  return (
    <View style={styles.row}>
      <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
      {hasDiscount ? (
        <>
          <Text style={styles.original}>{formatPrice(product.price)}</Text>
          <Text style={styles.discount}>{product.discountPercent}% OFF</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  price: { ...typography.price, color: colors.primaryText },
  original: { ...typography.bodySmall, color: colors.mutedText, textDecorationLine: "line-through" },
  discount: { ...typography.caption, color: colors.accent },
});
