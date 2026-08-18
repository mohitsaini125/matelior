import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { CartItem } from "@/types/cart";
import { formatPrice } from "@/utils/formatPrice";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import { resolveProductImageUrl } from "@/utils/imageUrl";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const product = item.product || {};
  const stock = product.stock ?? 10;
  const insufficientStock = item.quantity > stock;
  const price = item.price ?? product.price ?? 0;
  const imageUrl = resolveProductImageUrl(product);

  return (
    <View style={styles.row}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name || "Product"}
        </Text>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        {insufficientStock ? (
          <Text style={styles.warning}>Only {stock} left in stock</Text>
        ) : null}
        <View style={styles.controlsRow}>
          <QuantitySelector
            quantity={item.quantity}
            max={stock}
            onChange={(q) => updateQuantity(item._id, q)}
          />
          <Pressable onPress={() => removeItem(item._id)} hitSlop={10}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  image: {
    width: 88,
    height: 100,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: { flex: 1, marginLeft: spacing.md, justifyContent: "center" },
  name: { ...typography.body, color: colors.primaryText, marginBottom: 4 },
  price: { ...typography.price, color: colors.accent, marginBottom: spacing.xs },
  warning: { ...typography.caption, color: colors.warning, marginBottom: spacing.xs },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  remove: { ...typography.bodySmall, color: colors.error, textDecorationLine: "underline" },
});
