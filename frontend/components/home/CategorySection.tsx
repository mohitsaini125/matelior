import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/constants/colors";
import { CategoryCard } from "@/components/category/CategoryCard";
import { Category } from "@/types/category";

export function CategorySection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop by Category</Text>
      <FlatList
        data={categories}
        keyExtractor={(c) => c._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CategoryCard category={item} fullWidth />
          </View>
        )}
      />
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
    letterSpacing: 0.5,
  },
  list: { paddingHorizontal: spacing.md },
  cardWrapper: { width: 170, marginRight: spacing.md },
});
