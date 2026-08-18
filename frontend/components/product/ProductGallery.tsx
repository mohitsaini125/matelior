import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { isValidHttpUrl } from "@/utils/imageUrl";

const { width } = Dimensions.get("window");
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000";

export function ProductGallery({ images }: { images?: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const validImages = (images && images.length > 0)
    ? images
        .map((img) => (typeof img === "string" && img.trim() ? img.trim() : ""))
        .filter((img) => isValidHttpUrl(img))
    : [];

  const displayList = validImages.length > 0 ? validImages : [DEFAULT_IMAGE];

  function scrollToIndex(index: number) {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }

  return (
    <View style={styles.container}>
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={displayList}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            if (index >= 0 && index < displayList.length) {
              setActiveIndex(index);
            }
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          )}
        />

        {displayList.length > 1 ? (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {displayList.length}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Pagination Dots */}
      {displayList.length > 1 ? (
        <View style={styles.dotsRow}>
          {displayList.map((_, i) => (
            <Pressable key={i} onPress={() => scrollToIndex(i)}>
              <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Thumbnail Selector Strip */}
      {displayList.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailStrip}
        >
          {displayList.map((uri, i) => (
            <Pressable
              key={i}
              onPress={() => scrollToIndex(i)}
              style={[styles.thumbnailWrapper, i === activeIndex && styles.thumbnailActive]}
            >
              <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  carouselWrapper: {
    position: "relative",
  },
  image: {
    width,
    aspectRatio: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  counterBadge: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  counterText: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: "700",
    fontSize: 10,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 16,
  },
  thumbnailStrip: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    justifyContent: "center",
  },
  thumbnailWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
  },
  thumbnailActive: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
});
