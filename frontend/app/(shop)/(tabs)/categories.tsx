import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import { ROUTES } from "@/constants/routes";

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  function load() {
    setStatus("loading");
    categoryService
      .list()
      .then((data) => {
        setCategories(data);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load categories");
        setStatus("error");
      });
  }

  useEffect(load, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Categories"
        showBack={false}
        right={
          <Pressable
            onPress={() => router.push(ROUTES.search as never)}
            hitSlop={10}
            style={{ padding: spacing.xs }}
          >
            <Ionicons name="search" size={22} color={colors.accent} />
          </Pressable>
        }
      />
      {status === "loading" ? <LoadingIndicator fullscreen={false} /> : null}
      {status === "error" ? <ErrorState message={error ?? undefined} onRetry={load} /> : null}
      {status === "success" ? <CategoryGrid categories={categories} /> : null}
    </View>
  );
}
