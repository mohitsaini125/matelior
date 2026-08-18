import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { Category } from "@/types/category";
import { ROUTES } from "@/constants/routes";
import { resolveCategoryImageUrl } from "@/utils/imageUrl";

interface CategoryCardProps {
  category: Category;
  fullWidth?: boolean;
}

export function CategoryCard({ category, fullWidth = false }: CategoryCardProps) {
  const router = useRouter();
  const slug = category.slug || category.name?.toLowerCase().trim().replace(/\s+/g, "-") || category._id;
  const imageUrl = resolveCategoryImageUrl(category);

  return (
    <Pressable
      style={[styles.card, fullWidth && styles.cardFullWidth]}
      onPress={() => router.push(ROUTES.category(slug) as never)}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {category.name}
          </Text>
          <Text style={styles.exploreText}>Explore Collection →</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    marginBottom: spacing.md,
  },
  cardFullWidth: {
    width: "100%",
    marginBottom: 0,
  },
  imageWrapper: {
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  content: {
    padding: spacing.md,
  },
  name: {
    ...typography.h3,
    color: colors.primaryText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exploreText: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
    fontWeight: "600",
  },
});
