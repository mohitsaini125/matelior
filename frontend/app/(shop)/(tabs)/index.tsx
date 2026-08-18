import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductSection } from "@/components/home/ProductSection";
import { BrandSection } from "@/components/home/BrandSection";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { useProductList } from "@/hooks/useProductList";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import { ROUTES } from "@/constants/routes";
import { getRecentSearches } from "@/utils/recentSearches";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const featured = useProductList({ sort: "popularity", order: "desc", limit: 10 });
  const newArrivals = useProductList({ sort: "newest", order: "desc", limit: 10 });

  useEffect(() => {
    categoryService
      .list()
      .then(setCategories)
      .catch((err) => setCategoriesError(err instanceof Error ? err.message : "Failed to load categories"));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getRecentSearches().then(setRecentSearches);
    }, [])
  );

  function handleSearchRecent(item: string) {
    router.push({
      pathname: ROUTES.search as any,
      params: { q: item },
    });
  }

  if (featured.status === "loading" && newArrivals.status === "loading") {
    return <LoadingIndicator />;
  }

  if (featured.status === "error" && newArrivals.status === "error") {
    return (
      <ErrorState
        message={featured.error ?? undefined}
        onRetry={() => {
          featured.reload();
          newArrivals.reload();
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <View style={styles.headerRow}>
          <Text style={styles.brandTitle}>MATELIOR</Text>
          <Pressable
            style={styles.searchButton}
            onPress={() => router.push(ROUTES.search as never)}
            hitSlop={10}
          >
            <Ionicons name="search" size={18} color={colors.accent} />
            <Text style={styles.searchText}>Search luxury items...</Text>
          </Pressable>
        </View>

        {/* Last 4 Recent Searches */}
        {recentSearches.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentSearchesScroll}
          >
            <View style={styles.recentLabelWrap}>
              <Ionicons name="time-outline" size={13} color={colors.mutedText} />
              <Text style={styles.recentLabel}>Recent:</Text>
            </View>
            {recentSearches.slice(0, 4).map((query, index) => (
              <Pressable
                key={index}
                style={styles.recentChip}
                onPress={() => handleSearchRecent(query)}
              >
                <Text style={styles.recentChipText}>{query}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSection />
        {categories.length > 0 ? (
          <FeaturedCollection
            title="New Arrivals"
            subtitle="The latest additions to the collection"
            imageUrl={categories[0]?.image ?? "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200"}
            categorySlug={categories[0]?.slug ?? "wallets"}
          />
        ) : null}
        <CategorySection categories={categories} />
        {categoriesError ? null : null}
        <ProductSection title="Featured Products" products={featured.products} />
        <ProductSection title="New Arrivals" products={newArrivals.products} />
        <BrandSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  brandTitle: {
    ...typography.h3,
    color: colors.primaryText,
    letterSpacing: 2,
    fontWeight: "700",
  },
  searchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: spacing.xs,
  },
  searchText: {
    ...typography.caption,
    color: colors.mutedText,
  },
  recentSearchesScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  recentLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight: 2,
  },
  recentLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.mutedText,
    fontWeight: "600",
  },
  recentChip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  recentChipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.secondaryText,
  },
});
