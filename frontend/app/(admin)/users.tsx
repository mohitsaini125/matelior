import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { api } from "@/services/api";
import { User, UserActivityResponse } from "@/types/user";
import { formatPrice } from "@/utils/formatPrice";

type UserSortOption = "newest" | "oldest" | "name_asc" | "name_desc" | "admins_first";
type UserRoleFilter = "ALL" | "CUSTOMERS" | "ADMINISTRATORS" | "WITH_PHONE";

const SORT_OPTIONS: { id: UserSortOption; label: string }[] = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "name_asc", label: "Name: A to Z" },
  { id: "name_desc", label: "Name: Z to A" },
  { id: "admins_first", label: "Admins First" },
];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  // Search, Sort & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<UserRoleFilter>("ALL");
  const [sortBy, setSortBy] = useState<UserSortOption>("newest");
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Selected User Activity State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityResponse | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(false);

  function load() {
    setStatus("loading");
    api
      .get<User[]>("/users/admin")
      .then((data) => {
        setUsers(data || []);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load users");
        setStatus("error");
      });
  }

  useEffect(load, []);

  async function openUserDetails(user: User) {
    setSelectedUserId(user._id);
    setActivityLoading(true);
    setUserActivity(null);
    try {
      const data = await api.get<UserActivityResponse>(`/users/admin/${user._id}`);
      setUserActivity(data);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Could not load user activity.");
    } finally {
      setActivityLoading(false);
    }
  }

  async function toggleUserRole() {
    if (!userActivity) return;
    const currentRole = userActivity.user.role;
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMessage =
      newRole === "admin"
        ? `Grant administrative privileges to ${userActivity.user.name}?`
        : `Demote ${userActivity.user.name} to regular customer?`;

    Alert.alert("Confirm Role Change", confirmMessage, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          setRoleUpdating(true);
          try {
            const updated = await api.patch<User>(`/users/admin/${userActivity.user._id}/role`, {
              role: newRole,
            });
            setUserActivity((prev) => (prev ? { ...prev, user: { ...prev.user, role: updated.role } } : null));
            setUsers((prev) =>
              prev.map((u) => (u._id === userActivity.user._id ? { ...u, role: updated.role } : u))
            );
          } catch (err) {
            Alert.alert("Role update failed", err instanceof Error ? err.message : "Try again");
          } finally {
            setRoleUpdating(false);
          }
        },
      },
    ]);
  }

  function resetFilters() {
    setSearchQuery("");
    setActiveFilter("ALL");
    setSortBy("newest");
  }

  const hasActiveFilters = searchQuery.trim().length > 0 || activeFilter !== "ALL" || sortBy !== "newest";

  const processedUsers = useMemo(() => {
    let list = [...users];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((u) => {
        return (
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q)) ||
          (u.role && u.role.toLowerCase().includes(q))
        );
      });
    }

    // Role / Phone Filter
    if (activeFilter === "CUSTOMERS") {
      list = list.filter((u) => u.role !== "admin");
    } else if (activeFilter === "ADMINISTRATORS") {
      list = list.filter((u) => u.role === "admin");
    } else if (activeFilter === "WITH_PHONE") {
      list = list.filter((u) => Boolean(u.phone && u.phone.trim()));
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name_desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortBy === "admins_first") {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (b.role === "admin" && a.role !== "admin") return 1;
        return (a.name || "").localeCompare(b.name || "");
      }
      // default "newest"
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }, [users, searchQuery, activeFilter, sortBy]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || "Sort";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Users Management" />

      <View style={styles.topControlSection}>
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.mutedText} style={{ marginRight: spacing.xs }} />
            <TextInput
              placeholder="Search users by name, email, phone, role..."
              placeholderTextColor={colors.mutedText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoCapitalize="none"
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.mutedText} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            style={[styles.sortButton, sortBy !== "newest" && styles.sortButtonActive]}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons
              name="swap-vertical"
              size={18}
              color={sortBy !== "newest" ? colors.background : colors.primaryText}
            />
            <Text style={[styles.sortButtonText, sortBy !== "newest" && styles.sortButtonTextActive]}>
              {activeSortLabel}
            </Text>
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {hasActiveFilters ? (
            <Pressable style={styles.resetChip} onPress={resetFilters}>
              <Ionicons name="refresh" size={12} color={colors.error} />
              <Text style={styles.resetChipText}>Reset</Text>
            </Pressable>
          ) : null}

          {[
            { id: "ALL", label: `All (${users.length})` },
            { id: "CUSTOMERS", label: "Customers" },
            { id: "ADMINISTRATORS", label: "Admins" },
            { id: "WITH_PHONE", label: "With Phone" },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.quickChip, activeFilter === tab.id && styles.quickChipActive]}
              onPress={() => setActiveFilter(tab.id as UserRoleFilter)}
            >
              <Text style={[styles.quickChipText, activeFilter === tab.id && styles.quickChipTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {status === "loading" ? <LoadingIndicator fullscreen={false} /> : null}
      {status === "error" ? <ErrorState message={error ?? undefined} onRetry={load} /> : null}
      {status === "success" && processedUsers.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching users found" : "No users registered yet"}
          actionLabel={hasActiveFilters ? "Reset Filters" : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      ) : null}

      {status === "success" && processedUsers.length > 0 ? (
        <FlatList
          data={processedUsers}
          keyExtractor={(u) => u._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => openUserDetails(item)}>
              <View style={styles.avatar}>
                <Ionicons
                  name={item.role === "admin" ? "shield-checkmark" : "person"}
                  size={20}
                  color={item.role === "admin" ? colors.accent : colors.secondaryText}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={[styles.roleBadge, item.role === "admin" && styles.roleBadgeAdmin]}>
                    <Text style={[styles.roleText, item.role === "admin" && styles.roleTextAdmin]}>
                      {item.role ? item.role.toUpperCase() : "CUSTOMER"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.email}>{item.email}</Text>
                <View style={styles.metaRow}>
                  {item.phone ? <Text style={styles.phone}>Phone: {item.phone}</Text> : null}
                  {item.createdAt ? (
                    <Text style={styles.joinedDate}>
                      Joined {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedText} />
            </Pressable>
          )}
        />
      ) : null}

      {/* User Details & Activity Modal */}
      <Modal visible={Boolean(selectedUserId)} onClose={() => setSelectedUserId(null)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>User Details & Activity</Text>
          <Pressable onPress={() => setSelectedUserId(null)} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>

        {activityLoading ? (
          <View style={{ padding: spacing.xl, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ ...typography.caption, color: colors.mutedText, marginTop: spacing.sm }}>
              Loading user profile & order history...
            </Text>
          </View>
        ) : userActivity ? (
          <ScrollView
            style={{ maxHeight: 520 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          >
            {/* User Profile Card */}
            <View style={styles.profileHero}>
              <View style={styles.heroAvatar}>
                <Ionicons
                  name={userActivity.user.role === "admin" ? "shield-checkmark" : "person"}
                  size={32}
                  color={colors.accent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{userActivity.user.name}</Text>
                <Text style={styles.heroEmail}>{userActivity.user.email}</Text>
                {userActivity.user.phone ? (
                  <Text style={styles.heroPhone}>📞 {userActivity.user.phone}</Text>
                ) : (
                  <Text style={styles.heroPhoneMuted}>No phone provided</Text>
                )}
                <View style={styles.heroMetaRow}>
                  <View
                    style={[
                      styles.roleBadge,
                      userActivity.user.role === "admin" && styles.roleBadgeAdmin,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        userActivity.user.role === "admin" && styles.roleTextAdmin,
                      ]}
                    >
                      {userActivity.user.role.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.heroDate}>
                    ID: {userActivity.user._id.slice(-8)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Role Toggle Button */}
            <Pressable
              style={[
                styles.roleToggleBtn,
                userActivity.user.role === "admin" ? styles.roleToggleDemote : styles.roleTogglePromote,
              ]}
              onPress={toggleUserRole}
              disabled={roleUpdating}
            >
              <Ionicons
                name={userActivity.user.role === "admin" ? "arrow-down-circle-outline" : "shield-outline"}
                size={16}
                color={userActivity.user.role === "admin" ? colors.error : colors.accent}
              />
              <Text
                style={[
                  styles.roleToggleText,
                  userActivity.user.role === "admin" && { color: colors.error },
                ]}
              >
                {roleUpdating
                  ? "Updating..."
                  : userActivity.user.role === "admin"
                  ? "Demote to Customer"
                  : "Promote to Administrator"}
              </Text>
            </Pressable>

            {/* Lifetime Activity Stats Grid */}
            <Text style={styles.sectionHeader}>Lifetime Activity Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{formatPrice(userActivity.analytics.totalSpend)}</Text>
                <Text style={styles.metricLabel}>Total Spend</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{userActivity.analytics.totalOrders}</Text>
                <Text style={styles.metricLabel}>Total Orders</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: "#4caf50" }]}>
                  {userActivity.analytics.deliveredOrders}
                </Text>
                <Text style={styles.metricLabel}>Delivered</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: colors.error }]}>
                  {userActivity.analytics.cancelledOrders + userActivity.analytics.returnedOrders}
                </Text>
                <Text style={styles.metricLabel}>Cancelled/Ret</Text>
              </View>
            </View>

            {/* Order History */}
            <Text style={styles.sectionHeader}>
              Order History ({userActivity.orders.length})
            </Text>
            {userActivity.orders.length === 0 ? (
              <View style={styles.emptyActivity}>
                <Ionicons name="receipt-outline" size={24} color={colors.mutedText} />
                <Text style={styles.emptyActivityText}>No orders placed yet by this user.</Text>
              </View>
            ) : (
              userActivity.orders.map((o) => (
                <View key={o._id} style={styles.orderItemCard}>
                  <View style={styles.orderItemHeader}>
                    <Text style={styles.orderNumber}>#{o.orderNumber || o._id.slice(-6)}</Text>
                    <View style={styles.orderStatusBadge}>
                      <Text style={styles.orderStatusText}>{o.orderStatus.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.orderMetaRow}>
                    <Text style={styles.orderAmount}>
                      {formatPrice(o.totalAmount || o.subTotal || 0)}
                    </Text>
                    <Text style={styles.orderDate}>
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  {(o.orderItems || o.items || []).length > 0 ? (
                    <Text style={styles.orderItemsSnippet} numberOfLines={1}>
                      Items:{" "}
                      {(o.orderItems || o.items || [])
                        .map((i: any) => `${i.productName || i.product?.name || "Item"} (x${i.quantity || 1})`)
                        .join(", ")}
                    </Text>
                  ) : null}
                </View>
              ))
            )}

            {/* Saved Addresses */}
            <Text style={styles.sectionHeader}>
              Saved Addresses ({userActivity.addresses.length})
            </Text>
            {userActivity.addresses.length === 0 ? (
              <View style={styles.emptyActivity}>
                <Ionicons name="location-outline" size={24} color={colors.mutedText} />
                <Text style={styles.emptyActivityText}>No saved delivery addresses found.</Text>
              </View>
            ) : (
              userActivity.addresses.map((addr) => (
                <View key={addr._id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressName}>{addr.fullName || addr.name}</Text>
                    {addr.isDefault ? (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.addressLine}>{addr.addressLine1 || addr.address}</Text>
                  {addr.addressLine2 ? <Text style={styles.addressLine}>{addr.addressLine2}</Text> : null}
                  <Text style={styles.addressLine}>
                    {addr.city}, {addr.state} - {addr.pincode || addr.postalCode}
                  </Text>
                  <Text style={styles.addressPhone}>Phone: {addr.phone}</Text>
                </View>
              ))
            )}

            <Button
              label="Close"
              variant="outline"
              onPress={() => setSelectedUserId(null)}
              style={{ marginTop: spacing.lg }}
            />
          </ScrollView>
        ) : null}
      </Modal>

      {/* Sort Selection Modal */}
      <Modal visible={sortModalVisible} onClose={() => setSortModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Sort Users</Text>
          <Pressable onPress={() => setSortModalVisible(false)} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>

        <View style={styles.sortList}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.sortOptionRow, sortBy === opt.id && styles.sortOptionRowActive]}
              onPress={() => {
                setSortBy(opt.id);
                setSortModalVisible(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === opt.id && styles.sortOptionTextActive]}>
                {opt.label}
              </Text>
              <Ionicons
                name={sortBy === opt.id ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={sortBy === opt.id ? colors.accent : colors.mutedText}
              />
            </Pressable>
          ))}
        </View>

        <Button
          label="Close"
          variant="outline"
          onPress={() => setSortModalVisible(false)}
          style={{ marginTop: spacing.md }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topControlSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBarRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.primaryText,
    ...typography.bodySmall,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  sortButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sortButtonText: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: "600",
  },
  sortButtonTextActive: {
    color: colors.background,
    fontWeight: "700",
  },
  chipsScroll: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  resetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: "rgba(220, 53, 69, 0.15)",
    borderWidth: 1,
    borderColor: colors.error,
  },
  resetChipText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.error,
    fontWeight: "700",
  },
  quickChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipActive: {
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderColor: colors.accent,
  },
  quickChipText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.secondaryText,
    fontWeight: "600",
  },
  quickChipTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  list: { padding: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { ...typography.body, color: colors.primaryText, fontWeight: "600" },
  email: { ...typography.caption, color: colors.secondaryText, marginTop: 2 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  phone: { ...typography.caption, color: colors.mutedText },
  joinedDate: { ...typography.caption, color: colors.mutedText, fontSize: 10 },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleBadgeAdmin: {
    borderColor: colors.accent,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
  },
  roleText: { ...typography.caption, color: colors.mutedText, fontSize: 10, fontWeight: "700" },
  roleTextAdmin: { color: colors.accent },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h2, color: colors.primaryText },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  heroName: { ...typography.h3, color: colors.primaryText },
  heroEmail: { ...typography.caption, color: colors.secondaryText, marginTop: 2 },
  heroPhone: { ...typography.caption, color: colors.accent, marginTop: 2, fontWeight: "600" },
  heroPhoneMuted: { ...typography.caption, color: colors.mutedText, marginTop: 2 },
  heroMetaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  heroDate: { ...typography.caption, color: colors.mutedText, fontSize: 10 },
  roleToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  roleTogglePromote: {
    backgroundColor: "rgba(201, 162, 39, 0.12)",
    borderColor: colors.accent,
  },
  roleToggleDemote: {
    backgroundColor: "rgba(220, 53, 69, 0.12)",
    borderColor: colors.error,
  },
  roleToggleText: { ...typography.caption, color: colors.accent, fontWeight: "700" },
  sectionHeader: {
    ...typography.caption,
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: "center",
  },
  metricValue: { ...typography.h3, color: colors.accent, fontWeight: "700" },
  metricLabel: { ...typography.caption, color: colors.mutedText, marginTop: 2, fontSize: 10 },
  emptyActivity: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  emptyActivityText: { ...typography.caption, color: colors.mutedText },
  orderItemCard: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  orderItemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderNumber: { ...typography.bodySmall, color: colors.primaryText, fontWeight: "600" },
  orderStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
  },
  orderStatusText: { ...typography.caption, color: colors.accent, fontSize: 9, fontWeight: "700" },
  orderMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  orderAmount: { ...typography.caption, color: colors.primaryText, fontWeight: "700" },
  orderDate: { ...typography.caption, color: colors.mutedText, fontSize: 10 },
  orderItemsSnippet: { ...typography.caption, color: colors.secondaryText, fontSize: 10, marginTop: 3 },
  addressCard: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  addressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addressName: { ...typography.bodySmall, color: colors.primaryText, fontWeight: "600" },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  defaultBadgeText: { ...typography.caption, color: "#4caf50", fontSize: 9, fontWeight: "700" },
  addressLine: { ...typography.caption, color: colors.secondaryText, marginTop: 2 },
  addressPhone: { ...typography.caption, color: colors.mutedText, marginTop: 2, fontSize: 10 },
  sortList: { gap: spacing.xs },
  sortOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortOptionRowActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(201, 162, 39, 0.1)",
  },
  sortOptionText: { ...typography.body, color: colors.primaryText },
  sortOptionTextActive: { color: colors.accent, fontWeight: "700" },
});
