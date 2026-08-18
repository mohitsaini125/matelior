import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/constants/colors";
import { Product } from "@/types/product";
import { ProductCarousel } from "./ProductCarousel";

interface ProductSectionProps {
  title: string;
  products: Product[];
}

export function ProductSection({ title, products }: ProductSectionProps) {
  if (products.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ProductCarousel products={products} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.xl },
  title: {
    ...typography.h2,
    color: colors.primaryText,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    textTransform: "uppercase",
  },
});
