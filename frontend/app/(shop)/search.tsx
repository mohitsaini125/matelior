import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Input } from "@/components/common/Input";
import { ProductGrid } from "@/components/product/ProductGrid";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProductList } from "@/hooks/useProductList";
import {
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
} from "@/utils/recentSearches";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q || "");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebouncedValue(query, 400);
  const { products, status, error, reload } = useProductList({ q: debouncedQuery, limit: 30 });

  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);

  useEffect(() => {
    if (params.q) {
      setQuery(params.q);
      saveRecentSearch(params.q).then(setRecentSearches);
    }
  }, [params.q]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      saveRecentSearch(debouncedQuery.trim()).then(setRecentSearches);
    }
  }, [debouncedQuery]);

  async function handleSelectRecent(item: string) {
    setQuery(item);
    const updated = await saveRecentSearch(item);
    setRecentSearches(updated);
  }

  async function handleRemoveRecent(item: string) {
    const updated = await removeRecentSearch(item);
    setRecentSearches(updated);
  }

  async function handleClearAll() {
    await clearRecentSearches();
    setRecentSearches([]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Search" showBack={true} />
      <View style={styles.searchBar}>
        <Input
          placeholder="Search MATELIOR..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => {
            if (query.trim()) {
              saveRecentSearch(query.trim()).then(setRecentSearches);
            }
          }}
        />
      </View>

      {debouncedQuery.trim().length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer} showsVerticalScrollIndicator={false}>
          {recentSearches.length > 0 ? (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                <Pressable onPress={handleClearAll} hitSlop={8}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </Pressable>
              </View>
              <View style={styles.chipsWrap}>
                {recentSearches.map((item, idx) => (
                  <View key={idx} style={styles.recentChip}>
                    <Pressable
                      style={styles.recentChipContent}
                      onPress={() => handleSelectRecent(item)}
                    >
                      <Ionicons name="time-outline" size={14} color={colors.accent} style={{ marginRight: 4 }} />
                      <Text style={styles.recentChipText}>{item}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveRecent(item)}
                      hitSlop={8}
                      style={styles.chipRemove}
                    >
                      <Ionicons name="close" size={14} color={colors.mutedText} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <EmptyState title="Search MATELIOR" message="Try “titanium ring”, “leather wallet”, or “bracelet”" />
        </ScrollView>
      ) : status === "loading" ? (
        <LoadingIndicator fullscreen={false} />
      ) : status === "error" ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : (
        <ProductGrid products={products} emptyMessage={`No results for "${debouncedQuery}"`} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  emptyContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  recentSection: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  recentTitle: {
    ...typography.caption,
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  clearAllText: {
    ...typography.caption,
    color: colors.error,
    fontSize: 11,
    fontWeight: "600",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: 6,
  },
  recentChipContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentChipText: {
    ...typography.bodySmall,
    color: colors.primaryText,
    marginRight: 4,
  },
  chipRemove: {
    padding: 2,
    marginLeft: 2,
  },
});
