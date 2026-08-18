import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { colors, spacing, typography } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";

const TABS = [
  { label: "Home", path: ROUTES.home },
  { label: "Categories", path: ROUTES.categories },
  { label: "Wishlist", path: ROUTES.wishlist },
  { label: "Cart", path: ROUTES.cart },
  { label: "Profile", path: ROUTES.profile },
] as const;

// Primary shop navigation destinations (spec: Home, Categories, Wishlist, Cart, Profile).
export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const active = pathname === tab.path || (tab.path === ROUTES.home && pathname === "/");
        return (
          <Pressable key={tab.path} style={styles.tab} onPress={() => router.push(tab.path as never)}>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            {tab.label === "Cart" && itemCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: { ...typography.caption, color: colors.mutedText, textTransform: "uppercase" },
  labelActive: { color: colors.primaryText },
  badge: {
    position: "absolute",
    top: -2,
    right: "30%",
    backgroundColor: colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, color: colors.background, fontWeight: "700" },
});
