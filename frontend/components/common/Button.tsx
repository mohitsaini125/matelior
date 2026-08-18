import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/colors";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.background : colors.primaryText} />
      ) : (
        <Text style={[styles.label, textVariantStyles[variant]]}>{label.toUpperCase()}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.button,
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: colors.primaryText },
  secondary: { backgroundColor: colors.surfaceSecondary },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: "transparent" },
};

const textVariantStyles: Record<string, { color: string }> = {
  primary: { color: colors.background },
  secondary: { color: colors.primaryText },
  outline: { color: colors.primaryText },
  ghost: { color: colors.secondaryText },
};
