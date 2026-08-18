import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { spacing } from "@/constants/colors";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p._id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <ProductCard product={item} fullWidth />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md },
  cardWrapper: { width: 175, marginRight: spacing.md },
});
