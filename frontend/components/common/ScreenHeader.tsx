import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/constants/colors";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, showBack = true, onBack, right }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const canGoBack = showBack && (!!onBack || router.canGoBack());

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.side}>
        {canGoBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.rightSide]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  side: { width: 44, justifyContent: "center" },
  rightSide: { alignItems: "flex-end" },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
  },
  title: {
    ...typography.h3,
    color: colors.primaryText,
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
