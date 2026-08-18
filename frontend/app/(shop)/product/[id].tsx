import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { Button } from "@/components/common/Button";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { reviewService } from "@/services/review.service";
import { Review } from "@/types/review";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { product, status, error, reload } = useProduct(id);
  const { isAuthenticated } = useAuth();
  const { addItem, isInCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (id) {
      reviewService.listForProduct(id).then(setReviews).catch(() => setReviews([]));
    }
  }, [id]);

  if (status === "loading" || status === "idle") return <LoadingIndicator />;
  if (status === "error" || !product) {
    return <ErrorState message={error ?? "Product not found"} onRetry={reload} />;
  }

  const outOfStock = product.stock === 0;
  const wishlisted = isAuthenticated && isWishlisted(product._id);
  const inCart = isAuthenticated && isInCart(product._id);

  async function handleAddToCart(buyNow: boolean) {
    if (!isAuthenticated) {
      router.push(ROUTES.login as never);
      return;
    }
    setAddingToCart(true);
    try {
      await addItem(product!._id, quantity);
      if (buyNow) {
        router.push(ROUTES.cart as never);
      }
    } catch (err) {
      Alert.alert("Couldn't add to cart", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={product.name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProductGallery images={product.images} />
        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.wishlistIcon} onPress={() => isAuthenticated && toggle(product._id)}>
              {wishlisted ? "♥" : "♡"}
            </Text>
          </View>
          {product.rating ? (
            <Text style={styles.rating}>
              {product.rating.toFixed(1)} ★ ({product.reviewCount ?? 0} reviews)
            </Text>
          ) : null}
          <PriceDisplay product={product} />

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Material</Text>
          <Text style={styles.sectionValue}>{product.material}</Text>
          <Text style={styles.sectionLabel}>Color</Text>
          <Text style={styles.sectionValue}>{product.color}</Text>

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.divider} />
          {outOfStock ? (
            <Text style={styles.outOfStock}>Out of stock</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Quantity</Text>
              <QuantitySelector quantity={quantity} onChange={setQuantity} max={product.stock} />
            </>
          )}

          {reviews.length > 0 ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Reviews</Text>
              {reviews.slice(0, 5).map((r) => {
                const reviewerName = typeof r.user === "object" ? r.user?.name : (r.userName || "Verified Buyer");
                const reviewText = r.review || r.comment || r.title || "";
                return (
                  <View key={r._id} style={styles.review}>
                    <Text style={styles.reviewTitle}>{reviewerName} — {r.rating}★</Text>
                    {reviewText ? <Text style={styles.reviewComment}>{reviewText}</Text> : null}
                  </View>
                );
              })}
            </>
          ) : null}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        {inCart ? (
          <Button
            label="Go to Cart →"
            variant="primary"
            onPress={() => router.push(ROUTES.cart as never)}
            style={styles.actionButton}
          />
        ) : (
          <Button
            label="Add to Cart"
            variant="outline"
            disabled={outOfStock}
            loading={addingToCart}
            onPress={() => handleAddToCart(false)}
            style={styles.actionButton}
          />
        )}
        <Button
          label="Buy Now"
          variant={inCart ? "outline" : "primary"}
          disabled={outOfStock}
          loading={addingToCart}
          onPress={() => {
            if (inCart) {
              router.push(ROUTES.cart as never);
            } else {
              handleAddToCart(true);
            }
          }}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { ...typography.h1, color: colors.primaryText, flex: 1, marginRight: spacing.sm },
  wishlistIcon: { fontSize: 24, color: colors.accent },
  rating: { ...typography.bodySmall, color: colors.secondaryText, marginTop: spacing.xs, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionLabel: { ...typography.caption, color: colors.mutedText, textTransform: "uppercase", marginBottom: spacing.xs },
  sectionValue: { ...typography.body, color: colors.primaryText, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.secondaryText, lineHeight: 22 },
  outOfStock: { ...typography.h3, color: colors.error },
  review: { marginBottom: spacing.md },
  reviewTitle: { ...typography.body, color: colors.primaryText },
  reviewComment: { ...typography.bodySmall, color: colors.secondaryText },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: { flex: 1 },
});
