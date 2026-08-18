import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";

interface FeaturedCollectionProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  categorySlug: string;
}

export function FeaturedCollection({ title, subtitle, imageUrl, categorySlug }: FeaturedCollectionProps) {
  const router = useRouter();
  return (
    <Pressable style={styles.container} onPress={() => router.push(ROUTES.category(categorySlug) as never)}>
      <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { height: 260, marginHorizontal: spacing.md, marginBottom: spacing.xl, justifyContent: "flex-end" },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  textBlock: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.white, textTransform: "uppercase" },
  subtitle: { ...typography.bodySmall, color: colors.secondaryText, marginTop: spacing.xs },
});
