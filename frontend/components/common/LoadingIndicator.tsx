import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "@/constants/colors";

export function LoadingIndicator({ fullscreen = true }: { fullscreen?: boolean }) {
  return (
    <View style={fullscreen ? styles.fullscreen : styles.inline}>
      <ActivityIndicator color={colors.silver} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  inline: { paddingVertical: 24, alignItems: "center" },
});
