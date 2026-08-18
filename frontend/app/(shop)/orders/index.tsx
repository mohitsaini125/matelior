import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { OrderCard } from "@/components/order/OrderCard";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { orderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { ROUTES } from "@/constants/routes";

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  function load() {
    setStatus("loading");
    orderService
      .list()
      .then((data) => {
        setOrders(data.items);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load orders");
        setStatus("error");
      });
  }

  useEffect(load, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="My Orders" />
      {status === "loading" ? <LoadingIndicator fullscreen={false} /> : null}
      {status === "error" ? <ErrorState message={error ?? undefined} onRetry={load} /> : null}
      {status === "success" && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          actionLabel="Start Shopping"
          onAction={() => router.push(ROUTES.home as never)}
        />
      ) : null}
      {status === "success" && orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      ) : null}
    </View>
  );
}
