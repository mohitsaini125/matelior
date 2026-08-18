import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";

export interface PaymentOption {
  id: "cod" | "razorpay";
  label: string;
  subtitle: string;
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
  available: boolean;
}

const METHODS: PaymentOption[] = [
  {
    id: "cod",
    label: "Cash on Delivery (COD)",
    subtitle: "Pay in cash or scan UPI code when your order is delivered.",
    icon: "cash-outline",
    available: true,
  },
  {
    id: "razorpay",
    label: "Razorpay Secure Online",
    subtitle: "Instant payment via UPI (GPay, PhonePe, Paytm), Cards & NetBanking.",
    badge: "RECOMMENDED",
    icon: "shield-checkmark-outline",
    available: true,
  },
];

export function PaymentSelector({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (method: "cod" | "razorpay") => void;
}) {
  return (
    <View style={styles.container}>
      {METHODS.map((method) => {
        const isSelected = selected === method.id;

        return (
          <Pressable
            key={method.id}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
            ]}
            onPress={() => onSelect(method.id)}
          >
            <View style={styles.headerRow}>
              <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                <Ionicons
                  name={method.icon}
                  size={22}
                  color={isSelected ? colors.accent : colors.primaryText}
                />
              </View>

              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.label,
                      isSelected && styles.labelSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                  {method.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{method.badge}</Text>
                    </View>
                  ) : (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableBadgeText}>AVAILABLE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.subtitle}>{method.subtitle}</Text>
              </View>

              <View style={styles.radioWrapper}>
                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={isSelected ? colors.accent : colors.border}
                />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: "rgba(201, 162, 39, 0.08)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  iconWrapper: {
    marginTop: 2,
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperSelected: {
    backgroundColor: "rgba(201, 162, 39, 0.15)",
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
    gap: 4,
  },
  label: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: "600",
  },
  labelSelected: {
    color: colors.accent,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  radioWrapper: {
    marginTop: 2,
    marginLeft: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: "rgba(201, 162, 39, 0.2)",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  badgeText: {
    ...typography.caption,
    color: colors.accent,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  availableBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.4)",
  },
  availableBadgeText: {
    ...typography.caption,
    color: "#4caf50",
    fontSize: 9,
    fontWeight: "700",
  },
});
