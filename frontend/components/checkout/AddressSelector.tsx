import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { Address } from "@/types/address";

interface AddressSelectorProps {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AddressSelector({ addresses, selectedId, onSelect }: AddressSelectorProps) {
  return (
    <View style={styles.container}>
      {addresses.map((address) => {
        const selected = address._id === selectedId;
        const postal = address.postalCode || address.pincode || "";
        return (
          <Pressable
            key={address._id}
            style={[styles.card, selected && styles.cardSelected]}
            onPress={() => onSelect(address._id)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.radio}>
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={selected ? colors.accent : colors.mutedText}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{address.fullName}</Text>
                  {address.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.line}>
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </Text>
                <Text style={styles.line}>
                  {address.city}, {address.state} {postal}
                </Text>
                <Text style={styles.phone}>Phone: {address.phone}</Text>
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
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: "rgba(201, 162, 39, 0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  radio: {
    marginTop: 2,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: { ...typography.body, color: colors.primaryText, fontWeight: "600" },
  line: { ...typography.bodySmall, color: colors.secondaryText, marginTop: 1 },
  phone: { ...typography.caption, color: colors.mutedText, marginTop: spacing.xs },
  defaultBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  defaultText: { ...typography.caption, color: colors.accent, fontSize: 9, fontWeight: "700" },
});
