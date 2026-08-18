import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { ROUTES } from "@/constants/routes";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { orderService } from "@/services/order.service";
import { api } from "@/services/api";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
  });

  useEffect(() => {
    api
      .get<{
        totalUsers: number;
        totalProducts: number;
        totalOrders: number;
        pendingOrders: number;
        deliveredOrders: number;
        totalRevenue: number;
      }>("/admin/dashboard")
      .then((data) => {
        if (data) {
          setStats({
            products: data.totalProducts ?? 0,
            categories: 0,
            orders: data.totalOrders ?? 0,
            users: data.totalUsers ?? 0,
          });
          // Also fetch categories count
          categoryService.list().then((cats) => {
            setStats((prev) => ({ ...prev, categories: cats?.length || 0 }));
          });
        }
      })
      .catch(() => {
        // Fallback to individual calls
        Promise.all([
          productService.list({ limit: 1 }).then((res) => res.total || 0).catch(() => 0),
          categoryService.list().then((res) => res?.length || 0).catch(() => 0),
          orderService.listAdmin(1, 1).then((res) => res.total || 0).catch(() => 0),
          api.get<any[]>("/users/admin").then((res) => res?.length || 0).catch(() => 0),
        ]).then(([products, categories, orders, users]) => {
          setStats({ products, categories, orders, users });
        });
      });
  }, []);

  const SECTIONS = [
    {
      label: "Products",
      count: stats.products,
      path: ROUTES.adminProducts,
      icon: "cube-outline" as const,
      description: "Add, edit, manage inventory, pricing & images",
    },
    {
      label: "Categories",
      count: stats.categories,
      path: ROUTES.adminCategories,
      icon: "grid-outline" as const,
      description: "Manage product collections & banner imagery",
    },
    {
      label: "Orders",
      count: stats.orders,
      path: ROUTES.adminOrders,
      icon: "receipt-outline" as const,
      description: "Manage orders, tracking & return requests",
    },
    {
      label: "Users",
      count: stats.users,
      path: ROUTES.adminUsers,
      icon: "people-outline" as const,
      description: "View customer directory, accounts & activity",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Admin Console"
        showBack={false}
        right={
          <Pressable
            onPress={() => router.replace(ROUTES.home as never)}
            hitSlop={8}
            style={styles.storeButton}
          >
            <Ionicons name="storefront-outline" size={20} color={colors.accent} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.products}</Text>
            <Text style={styles.metricLabel}>Products</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.categories}</Text>
            <Text style={styles.metricLabel}>Categories</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.orders}</Text>
            <Text style={styles.metricLabel}>Orders</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.users}</Text>
            <Text style={styles.metricLabel}>Users</Text>
          </View>
        </View>

        {SECTIONS.map((section) => (
          <Pressable
            key={section.path}
            style={styles.card}
            onPress={() => router.push(section.path as never)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconWrapper}>
                <Ionicons name={section.icon} size={22} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{section.label}</Text>
                <Text style={styles.description}>{section.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedText} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  storeButton: {
    padding: spacing.xs,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: { ...typography.h2, color: colors.accent, fontWeight: "700" },
  metricLabel: { ...typography.caption, color: colors.secondaryText, marginTop: 2, textTransform: "uppercase", fontSize: 9 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: "rgba(201, 162, 39, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: { ...typography.h3, color: colors.primaryText, marginBottom: 2 },
  description: { ...typography.bodySmall, color: colors.mutedText },
});
