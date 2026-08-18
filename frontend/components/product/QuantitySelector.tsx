import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/colors";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
  min?: number;
}

export function QuantitySelector({ quantity, onChange, max = 99, min = 1 }: QuantitySelectorProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.button}
        disabled={quantity <= min}
        onPress={() => onChange(Math.max(min, quantity - 1))}
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{quantity}</Text>
      <Pressable
        style={styles.button}
        disabled={quantity >= max}
        onPress={() => onChange(Math.min(max, quantity + 1))}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  button: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  buttonText: { ...typography.h3, color: colors.primaryText },
  value: { ...typography.body, color: colors.primaryText, minWidth: 32, textAlign: "center" },
});
