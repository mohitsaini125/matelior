import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Category } from "@/types/category";
import { CategoryCard } from "./CategoryCard";
import { EmptyState } from "@/components/common/EmptyState";
import { spacing } from "@/constants/colors";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <EmptyState title="No categories available" />;
  }
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <CategoryCard category={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: "space-between" },
  content: { padding: spacing.md },
});
