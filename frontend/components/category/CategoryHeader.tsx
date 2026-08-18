import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { Category } from "@/types/category";
import { resolveCategoryImageUrl } from "@/utils/imageUrl";

export function CategoryHeader({ category }: { category: Category }) {
  const imageUrl = resolveCategoryImageUrl(category);

  return (
    <View style={styles.container}>
      <View style={styles.bannerWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.bannerImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.title}>{category.name}</Text>
          {category.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {category.description}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  bannerWrapper: {
    height: 140,
    borderRadius: radius.md,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primaryText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    ...typography.bodySmall,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
});
