import React from "react";
import { Redirect, Stack } from "expo-router";
import { colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";

// Admin route group has a completely separate navigation experience.
// Customers are redirected out; only role === "admin" may enter.
// The backend must independently enforce this on every admin API call —
// this check only protects the UI.
export default function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingIndicator />;
  if (!isAuthenticated || user?.role !== "admin") {
    return <Redirect href={"/(shop)/(tabs)" as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="products" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="users" />
    </Stack>
  );
}
