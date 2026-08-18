import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

const CUSTOMER_MENU = [
  { label: "My Orders", path: ROUTES.orders },
  { label: "Addresses", path: ROUTES.addresses },
  { label: "Wishlist", path: ROUTES.wishlist, params: { from: "profile" } },
  { label: "Edit Profile", path: ROUTES.editProfile },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Profile" showBack={false} />
        <EmptyState
          title="Log in to your account"
          actionLabel="Log In"
          onAction={() => router.push(ROUTES.login as never)}
        />
      </View>
    );
  }

  function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Profile" showBack={false} />
      <View style={styles.header}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.role === "admin" ? (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMINISTRATOR</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.menu}>
        {user.role === "admin" ? (
          <Pressable
            style={[styles.menuItem, styles.adminMenuItem]}
            onPress={() => router.push(ROUTES.admin as never)}
          >
            <Text style={[styles.menuLabel, styles.adminMenuLabel]}>Admin Dashboard</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ) : null}
        {CUSTOMER_MENU.map((item) => (
          <Pressable
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              if (item.params) {
                router.push({ pathname: item.path, params: item.params } as never);
              } else {
                router.push(item.path as never);
              }
            }}
          >
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
        <Pressable style={styles.menuItem} onPress={handleLogout}>
          <Text style={[styles.menuLabel, styles.logout]}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { ...typography.h1, color: colors.primaryText },
  email: { ...typography.bodySmall, color: colors.mutedText, marginTop: 4 },
  adminBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.background,
    letterSpacing: 0.5,
  },
  menu: { padding: spacing.md },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  adminMenuItem: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  adminMenuLabel: {
    color: colors.accent,
    fontWeight: "600",
  },
  menuLabel: { ...typography.body, color: colors.primaryText },
  chevron: { ...typography.h3, color: colors.mutedText },
  logout: { color: colors.error },
});
