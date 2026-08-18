import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/constants/colors";
import { ShopNowButton } from "./ShopNowButton";

export function HeroSection() {
  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1509941943102-10c232535736?w=1200" }}
      style={styles.container}
      imageStyle={styles.image}
    >
      <View style={styles.overlay} />
      <Text style={styles.brand}>MATELIOR</Text>
      <Text style={styles.tagline}>Accessories, engineered for permanence.</Text>
      <ShopNowButton label="Explore Collection" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { height: 480, justifyContent: "flex-end", padding: spacing.lg },
  image: { opacity: 0.7 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  brand: { ...typography.display, color: colors.white, letterSpacing: 4, marginBottom: spacing.xs },
  tagline: { ...typography.body, color: colors.secondaryText, marginBottom: spacing.lg },
});
