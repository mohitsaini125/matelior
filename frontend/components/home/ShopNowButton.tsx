import React from "react";
import { useRouter } from "expo-router";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";

export function ShopNowButton({ label = "Shop Now" }: { label?: string }) {
  const router = useRouter();
  return (
    <Button
      label={label}
      onPress={() => router.push(ROUTES.categories as never)}
      variant="primary"
      style={{ alignSelf: "flex-start", paddingHorizontal: 32 }}
    />
  );
}
