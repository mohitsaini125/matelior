import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/common/EmptyState";
import { spacing } from "@/constants/colors";

interface ProductGridProps {
  products: Product[];
  onEndReached?: () => void;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement;
}

export function ProductGrid({ products, onEndReached, emptyMessage, ListHeaderComponent }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState title="No products found" message={emptyMessage} />;
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <ProductCard product={item} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: "space-between" },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
});
