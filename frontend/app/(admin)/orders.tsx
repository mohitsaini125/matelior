import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types/order";
import { formatPrice } from "@/utils/formatPrice";

const STATUS_TRANSITIONS: Record<string, OrderStatus> = {
  pending: "confirmed",
  confirmed: "packed",
  packed: "out for delivery",
  shipped: "out for delivery",
  "out for delivery": "delivered",
};

const RETURN_TRANSITIONS: Record<string, string> = {
  requested: "approved",
  approved: "picked",
  picked: "completed",
};

const FILTER_TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "OUT FOR DELIVERY",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
];

type OrderSortOption =
  | "newest"
  | "oldest"
  | "amount_desc"
  | "amount_asc"
  | "items_desc"
  | "customer_asc";

type ReturnFilterOption = "all" | "any_return" | "requested" | "approved" | "picked" | "completed";
type PaymentFilterOption = "all" | "cod" | "online";
type PriceRangeFilter = "all" | "under_1k" | "1k_to_3k" | "3k_to_5k" | "above_5k";

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Search, Sort & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [sortBy, setSortBy] = useState<OrderSortOption>("newest");
  const [filterReturn, setFilterReturn] = useState<ReturnFilterOption>("all");
  const [filterPayment, setFilterPayment] = useState<PaymentFilterOption>("all");
  const [filterPriceRange, setFilterPriceRange] = useState<PriceRangeFilter>("all");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  function load() {
    setStatus("loading");
    orderService
      .listAdmin(1, 100)
      .then((data) => {
        setOrders(data.items || []);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load orders");
        setStatus("error");
      });
  }

  useEffect(load, []);

  async function handleAdvanceStatus(order: Order) {
    const nextStatus = STATUS_TRANSITIONS[order.orderStatus];
    if (!nextStatus) return;

    setUpdatingId(order._id);
    try {
      await orderService.updateStatus(order._id, nextStatus);
      load();
    } catch (err) {
      Alert.alert("Update failed", err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAdvanceReturnStatus(order: Order) {
    const currentReturnStatus = order.returnInformation?.status;
    const nextReturnStatus = currentReturnStatus ? RETURN_TRANSITIONS[currentReturnStatus] : undefined;
    if (!nextReturnStatus) return;

    setUpdatingId(order._id);
    try {
      await orderService.updateReturnStatus(order._id, nextReturnStatus);
      load();
    } catch (err) {
      Alert.alert("Return update failed", err instanceof Error ? err.message : "Could not update return status.");
    } finally {
      setUpdatingId(null);
    }
  }

  function resetFilters() {
    setSearchQuery("");
    setActiveTab("ALL");
    setSortBy("newest");
    setFilterReturn("all");
    setFilterPayment("all");
    setFilterPriceRange("all");
  }

  const hasAdvancedFilters =
    filterReturn !== "all" ||
    filterPayment !== "all" ||
    filterPriceRange !== "all" ||
    sortBy !== "newest";

  const hasAnyFilterActive = hasAdvancedFilters || activeTab !== "ALL" || searchQuery.trim().length > 0;

  const processedOrders = useMemo(() => {
    let list = [...orders];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((order) => {
        const orderNum = (order.orderNumber || order._id).toLowerCase();
        const userName = (typeof order.user === "object" ? (order.user as any)?.name : "").toLowerCase();
        const userEmail = (typeof order.user === "object" ? (order.user as any)?.email : "").toLowerCase();
        const userPhone = (order.shippingAddress?.phone || (typeof order.user === "object" ? (order.user as any)?.phone : "") || "").toLowerCase();
        const city = (order.shippingAddress?.city || "").toLowerCase();
        const state = (order.shippingAddress?.state || "").toLowerCase();
        const pincode = (order.shippingAddress?.postalCode || order.shippingAddress?.pincode || "").toLowerCase();
        const orderStatus = (order.orderStatus || "").toLowerCase();
        const itemNames = (order.orderItems || order.items || [])
          .map((i: any) => (i.productName || i.product?.name || "").toLowerCase())
          .join(" ");
        const returnReason = (order.returnInformation?.reason || "").toLowerCase();
        const cancelReason = (order.cancellationInformation?.reason || "").toLowerCase();

        return (
          orderNum.includes(q) ||
          userName.includes(q) ||
          userEmail.includes(q) ||
          userPhone.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          pincode.includes(q) ||
          orderStatus.includes(q) ||
          itemNames.includes(q) ||
          returnReason.includes(q) ||
          cancelReason.includes(q)
        );
      });
    }

    // 2. Tab Filter
    if (activeTab !== "ALL") {
      if (activeTab === "RETURNED") {
        list = list.filter(
          (o) => o.orderStatus === "returned" || Boolean(o.returnInformation && o.returnInformation.status)
        );
      } else {
        list = list.filter((o) => (o.orderStatus || "").toUpperCase() === activeTab);
      }
    }

    // 3. Return Filter
    if (filterReturn === "any_return") {
      list = list.filter((o) => o.orderStatus === "returned" || Boolean(o.returnInformation));
    } else if (filterReturn !== "all") {
      list = list.filter((o) => o.returnInformation?.status === filterReturn);
    }

    // 4. Payment Filter
    if (filterPayment === "cod") {
      list = list.filter((o) => (o as any).payment?.paymentMethod?.toLowerCase() === "cod" || (o as any).paymentMethod?.toLowerCase() === "cod");
    } else if (filterPayment === "online") {
      list = list.filter((o) => (o as any).payment?.paymentMethod?.toLowerCase() !== "cod");
    }

    // 5. Price Range Filter
    if (filterPriceRange === "under_1k") {
      list = list.filter((o) => (o.totalAmount || o.subTotal || 0) < 1000);
    } else if (filterPriceRange === "1k_to_3k") {
      list = list.filter((o) => {
        const val = o.totalAmount || o.subTotal || 0;
        return val >= 1000 && val <= 3000;
      });
    } else if (filterPriceRange === "3k_to_5k") {
      list = list.filter((o) => {
        const val = o.totalAmount || o.subTotal || 0;
        return val >= 3000 && val <= 5000;
      });
    } else if (filterPriceRange === "above_5k") {
      list = list.filter((o) => (o.totalAmount || o.subTotal || 0) > 5000);
    }

    // 6. Sorting
    list.sort((a, b) => {
      const amountA = a.totalAmount || a.subTotal || 0;
      const amountB = b.totalAmount || b.subTotal || 0;
      const itemsA = a.orderItems?.length || a.items?.length || 0;
      const itemsB = b.orderItems?.length || b.items?.length || 0;
      const nameA = (typeof a.user === "object" ? (a.user as any)?.name : "") || "";
      const nameB = (typeof b.user === "object" ? (b.user as any)?.name : "") || "";

      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "amount_desc") {
        return amountB - amountA;
      }
      if (sortBy === "amount_asc") {
        return amountA - amountB;
      }
      if (sortBy === "items_desc") {
        return itemsB - itemsA;
      }
      if (sortBy === "customer_asc") {
        return nameA.localeCompare(nameB);
      }
      // default "newest"
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }, [orders, searchQuery, activeTab, filterReturn, filterPayment, filterPriceRange, sortBy]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Orders Management" />

      <View style={styles.topControlSection}>
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.mutedText} style={{ marginRight: spacing.xs }} />
            <TextInput
              placeholder="Search by order #, customer, email, items..."
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
            style={[styles.filterButton, hasAdvancedFilters && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={hasAdvancedFilters ? colors.background : colors.primaryText}
            />
            <Text style={[styles.filterButtonText, hasAdvancedFilters && styles.filterButtonTextActive]}>
              Filter & Sort
            </Text>
          </Pressable>
        </View>

        {/* Quick Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {hasAnyFilterActive ? (
            <Pressable style={styles.resetChip} onPress={resetFilters}>
              <Ionicons name="refresh" size={12} color={colors.error} />
              <Text style={styles.resetChipText}>Reset All</Text>
            </Pressable>
          ) : null}

          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.quickChip, activeTab === tab && styles.quickChipActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.quickChipText, activeTab === tab && styles.quickChipTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {status === "loading" ? <LoadingIndicator fullscreen={false} /> : null}
      {status === "error" ? <ErrorState message={error ?? undefined} onRetry={load} /> : null}
      {status === "success" && processedOrders.length === 0 ? (
        <EmptyState
          title={hasAnyFilterActive ? "No matching orders found" : "No orders yet"}
          message={hasAnyFilterActive ? "Try adjusting your search keywords or filter criteria." : undefined}
          actionLabel={hasAnyFilterActive ? "Reset Filters" : undefined}
          onAction={hasAnyFilterActive ? resetFilters : undefined}
        />
      ) : null}

      {status === "success" && processedOrders.length > 0 ? (
        <FlatList
          data={processedOrders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          renderItem={({ item }) => {
            const nextStatus = STATUS_TRANSITIONS[item.orderStatus];
            const userName = typeof item.user === "object" ? (item.user as any)?.name : "Customer";
            const userEmail = typeof item.user === "object" ? (item.user as any)?.email : "";
            const isDelivered = item.orderStatus === "delivered";
            const isOutForDelivery = item.orderStatus === "out for delivery";
            const isCancelled = item.orderStatus === "cancelled";
            const isReturned = item.orderStatus === "returned" || Boolean(item.returnInformation);
            const returnInfo = item.returnInformation;
            const nextReturnStep = returnInfo?.status ? RETURN_TRANSITIONS[returnInfo.status] : undefined;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderNumber}>#{item.orderNumber || item._id.slice(-6)}</Text>
                    <Text style={styles.customer}>{userName} {userEmail ? `· ${userEmail}` : ""}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isDelivered && styles.statusDelivered,
                      isOutForDelivery && styles.statusOutForDelivery,
                      isCancelled && styles.statusCancelled,
                      isReturned && styles.statusReturned,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isDelivered && styles.statusTextDelivered,
                        isCancelled && styles.statusTextCancelled,
                        isReturned && styles.statusTextReturned,
                      ]}
                    >
                      {item.orderStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Return Information Banner */}
                {returnInfo ? (
                  <View style={styles.returnBanner}>
                    <Ionicons name="return-up-back" size={16} color={colors.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.returnTitle}>
                        Return Status: {returnInfo.status.toUpperCase()}
                      </Text>
                      {returnInfo.reason ? (
                        <Text style={styles.returnReason}>Reason: "{returnInfo.reason}"</Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {/* Cancellation Banner */}
                {item.cancellationInformation ? (
                  <View style={styles.cancelBanner}>
                    <Ionicons name="close-circle-outline" size={16} color={colors.error} />
                    <Text style={styles.cancelReason}>
                      Cancelled ({item.cancellationInformation.cancelledBy}): "{item.cancellationInformation.reason}"
                    </Text>
                  </View>
                ) : null}

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                  <Text style={styles.meta}>
                    {item.orderItems?.length || item.items?.length || 0} item(s) · Total: {formatPrice(item.totalAmount || item.subTotal || 0)}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                {/* Action for Order Progression */}
                {nextStatus && !returnInfo ? (
                  <Pressable
                    style={[styles.actionBtn, updatingId === item._id && styles.actionBtnDisabled]}
                    onPress={() => handleAdvanceStatus(item)}
                    disabled={updatingId === item._id}
                  >
                    <Text style={styles.actionBtnText}>
                      {updatingId === item._id ? "Updating..." : `Advance → Mark as ${nextStatus.toUpperCase()}`}
                    </Text>
                  </Pressable>
                ) : null}

                {/* Action for Return Progression */}
                {nextReturnStep ? (
                  <Pressable
                    style={[styles.returnActionBtn, updatingId === item._id && styles.actionBtnDisabled]}
                    onPress={() => handleAdvanceReturnStatus(item)}
                    disabled={updatingId === item._id}
                  >
                    <Text style={styles.returnActionBtnText}>
                      {updatingId === item._id
                        ? "Updating Return..."
                        : nextReturnStep === "approved"
                        ? "Approve Return Request →"
                        : nextReturnStep === "picked"
                        ? "Mark Return as Picked Up →"
                        : "Complete Return & Finalize Refund ✓"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          }}
        />
      ) : null}

      {/* Advanced Filter & Sort Modal */}
      <Modal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter & Sort Orders</Text>
          <Pressable onPress={() => setFilterModalVisible(false)} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>

        <ScrollView
          style={{ maxHeight: 500 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          <Text style={styles.filterSectionTitle}>Sort Orders</Text>
          <View style={styles.pillsContainer}>
            {[
              { id: "newest", label: "Newest First" },
              { id: "oldest", label: "Oldest First" },
              { id: "amount_desc", label: "Amount: High to Low" },
              { id: "amount_asc", label: "Amount: Low to High" },
              { id: "items_desc", label: "Most Items" },
              { id: "customer_asc", label: "Customer: A to Z" },
            ].map((s) => (
              <Pressable
                key={s.id}
                style={[styles.pill, sortBy === s.id && styles.pillActive]}
                onPress={() => setSortBy(s.id as OrderSortOption)}
              >
                <Text style={[styles.pillText, sortBy === s.id && styles.pillTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Returned Products Filter</Text>
          <View style={styles.pillsContainer}>
            {[
              { id: "all", label: "All Orders" },
              { id: "any_return", label: "Any Return (All)" },
              { id: "requested", label: "Return Requested" },
              { id: "approved", label: "Return Approved" },
              { id: "picked", label: "Return Picked Up" },
              { id: "completed", label: "Return Completed" },
            ].map((r) => (
              <Pressable
                key={r.id}
                style={[styles.pill, filterReturn === r.id && styles.pillActive]}
                onPress={() => setFilterReturn(r.id as ReturnFilterOption)}
              >
                <Text style={[styles.pillText, filterReturn === r.id && styles.pillTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Payment Method</Text>
          <View style={styles.pillsContainer}>
            {[
              { id: "all", label: "All Payment Methods" },
              { id: "cod", label: "Cash on Delivery (COD)" },
              { id: "online", label: "Online Payments" },
            ].map((p) => (
              <Pressable
                key={p.id}
                style={[styles.pill, filterPayment === p.id && styles.pillActive]}
                onPress={() => setFilterPayment(p.id as PaymentFilterOption)}
              >
                <Text style={[styles.pillText, filterPayment === p.id && styles.pillTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Order Total Value</Text>
          <View style={styles.pillsContainer}>
            {[
              { id: "all", label: "All Prices" },
              { id: "under_1k", label: "Under ₹1,000" },
              { id: "1k_to_3k", label: "₹1,000 - ₹3,000" },
              { id: "3k_to_5k", label: "₹3,000 - ₹5,000" },
              { id: "above_5k", label: "Above ₹5,000" },
            ].map((pr) => (
              <Pressable
                key={pr.id}
                style={[styles.pill, filterPriceRange === pr.id && styles.pillActive]}
                onPress={() => setFilterPriceRange(pr.id as PriceRangeFilter)}
              >
                <Text style={[styles.pillText, filterPriceRange === pr.id && styles.pillTextActive]}>
                  {pr.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
            <Button label="Apply Filters" onPress={() => setFilterModalVisible(false)} />
            <Button label="Reset All Filters" variant="outline" onPress={resetFilters} />
          </View>
        </ScrollView>
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
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: "600",
  },
  filterButtonTextActive: {
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  orderNumber: { ...typography.h3, color: colors.primaryText },
  customer: { ...typography.caption, color: colors.secondaryText, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusDelivered: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderColor: "#4caf50",
  },
  statusOutForDelivery: {
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderColor: colors.accent,
  },
  statusCancelled: {
    backgroundColor: "rgba(220, 53, 69, 0.15)",
    borderColor: colors.error,
  },
  statusReturned: {
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    borderColor: "#ff9800",
  },
  statusText: { ...typography.caption, color: colors.accent, fontWeight: "700", fontSize: 10 },
  statusTextDelivered: { color: "#4caf50" },
  statusTextCancelled: { color: colors.error },
  statusTextReturned: { color: "#ff9800" },
  returnBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
    borderRadius: radius.sm,
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
  returnTitle: {
    ...typography.caption,
    color: "#ff9800",
    fontWeight: "700",
    fontSize: 10,
  },
  returnReason: {
    ...typography.caption,
    color: colors.secondaryText,
    fontSize: 10,
    marginTop: 1,
  },
  cancelBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(220, 53, 69, 0.3)",
    borderRadius: radius.sm,
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
  cancelReason: {
    ...typography.caption,
    color: colors.error,
    fontSize: 10,
    flex: 1,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  meta: { ...typography.bodySmall, color: colors.primaryText },
  date: { ...typography.caption, color: colors.mutedText },
  actionBtn: {
    marginTop: spacing.sm,
    backgroundColor: "rgba(201, 162, 39, 0.12)",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { ...typography.caption, color: colors.accent, fontWeight: "700", letterSpacing: 0.5 },
  returnActionBtn: {
    marginTop: spacing.xs,
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    borderWidth: 1,
    borderColor: "#ff9800",
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  returnActionBtnText: {
    ...typography.caption,
    color: "#ff9800",
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h2, color: colors.primaryText },
  filterSectionTitle: {
    ...typography.caption,
    color: colors.mutedText,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
  },
  pillText: {
    ...typography.caption,
    color: colors.secondaryText,
    textTransform: "capitalize",
  },
  pillTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
});
