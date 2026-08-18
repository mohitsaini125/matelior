import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/constants/colors";

export function BrandSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Crafted to Last</Text>
      <Text style={styles.body}>
        Every MATELIOR piece is made from materials chosen for durability and
        understated presence — stainless steel, full-grain leather, titanium.
        Designed to be worn daily, for years.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: "center" },
  heading: { ...typography.h1, color: colors.primaryText, marginBottom: spacing.md, textAlign: "center" },
  body: { ...typography.body, color: colors.mutedText, textAlign: "center", lineHeight: 22 },
});
