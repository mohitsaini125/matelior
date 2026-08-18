import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import { useProductList } from "@/hooks/useProductList";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!slug) return;
    categoryService
      .getBySlug(slug)
      .then(setCategory)
      .catch(() => {
        // Fallback synthetic category
        setCategory({
          _id: slug,
          name: slug.replace(/-/g, " "),
          slug: slug,
        });
      });
  }, [slug]);

  const { products, status, error, reload } = useProductList({ category: slug, limit: 30 });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={category?.name ?? "Collection"} />
      {status === "loading" && products.length === 0 ? (
        <LoadingIndicator fullscreen={false} />
      ) : status === "error" ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : (
        <ProductGrid
          products={products}
          ListHeaderComponent={category ? <CategoryHeader category={category} /> : undefined}
          emptyMessage="No products found in this category"
        />
      )}
    </View>
  );
}
