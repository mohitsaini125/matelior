import React from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/constants/colors";

export function AuthFormLayout({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
});
