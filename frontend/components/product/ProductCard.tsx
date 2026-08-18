import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { Product } from "@/types/product";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { resolveProductImageUrl } from "@/utils/imageUrl";

interface ProductCardProps {
  product: Product;
  fullWidth?: boolean;
}

export function ProductCard({ product, fullWidth = false }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isAuthenticated && isWishlisted(product._id);
  const imageUrl = resolveProductImageUrl(product);

  return (
    <Pressable
      style={[styles.card, fullWidth && styles.cardFullWidth]}
      onPress={() => router.push(ROUTES.product(product._id) as never)}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={250}
        />
        {isAuthenticated ? (
          <Pressable
            style={styles.heart}
            hitSlop={10}
            onPress={(e) => {
              e.stopPropagation();
              toggle(product._id);
            }}
          >
            <Text style={[styles.heartIcon, wishlisted && styles.heartActive]}>
              {wishlisted ? "♥" : "♡"}
            </Text>
          </Pressable>
        ) : null}
        {product.stock === 0 ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <PriceDisplay product={product} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: "48%", marginBottom: spacing.lg },
  cardFullWidth: { width: "100%", marginBottom: 0 },
  imageWrapper: {
    aspectRatio: 0.85,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: "100%", height: "100%" },
  heart: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  heartIcon: { fontSize: 16, color: colors.white },
  heartActive: { color: colors.accent },
  outOfStockBadge: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  outOfStockText: { ...typography.caption, color: colors.white, fontSize: 9, fontWeight: "700" },
  name: { ...typography.body, color: colors.primaryText, marginBottom: 2 },
});
