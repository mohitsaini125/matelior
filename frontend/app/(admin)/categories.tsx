import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";

type CategorySortOption = "name_asc" | "name_desc" | "newest";

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<CategorySortOption>("name_asc");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function load() {
    setStatus("loading");
    categoryService
      .list()
      .then((data) => {
        setCategories(data || []);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load categories");
        setStatus("error");
      });
  }

  useEffect(load, []);

  function handleNameChange(text: string) {
    setName(text);
    if (!editingId) {
      // Auto-generate slug for new category
      const generatedSlug = text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  }

  function openAddModal() {
    setEditingId(null);
    setName("");
    setSlug("");
    setImageUrl("");
    setDescription("");
    setFormErrors({});
    setModalVisible(true);
  }

  function openEditModal(category: Category) {
    setEditingId(category._id);
    setName(category.name || "");
    setSlug(category.slug || "");
    setImageUrl(category.image || "");
    setDescription(category.description || "");
    setFormErrors({});
    setModalVisible(true);
  }

  async function handleSaveCategory() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Category name is required";
    if (!slug.trim()) nextErrors.slug = "Slug identifier is required";

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload: Partial<Category> = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        image: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
      };

      if (editingId) {
        await categoryService.update(editingId, payload);
      } else {
        await categoryService.create(payload);
      }

      setModalVisible(false);
      load();
    } catch (err) {
      Alert.alert("Save Failed", err instanceof Error ? err.message : "Could not save category.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string, catName: string) {
    Alert.alert("Delete Category", `Are you sure you want to delete "${catName}"? Products in this category will need to be reassigned.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await categoryService.remove(id);
            load();
          } catch (err) {
            Alert.alert("Delete failed", err instanceof Error ? err.message : "Try again");
          }
        },
      },
    ]);
  }

  const processedCategories = useMemo(() => {
    let list = [...categories];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => {
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.slug && c.slug.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "name_desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      // default name_asc
      return (a.name || "").localeCompare(b.name || "");
    });

    return list;
  }, [categories, searchQuery, sortBy]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Categories Management"
        right={
          <Pressable onPress={openAddModal} hitSlop={10} style={styles.addButton}>
            <Ionicons name="add-circle" size={26} color={colors.accent} />
          </Pressable>
        }
      />

      <View style={styles.topControlSection}>
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.mutedText} style={{ marginRight: spacing.xs }} />
            <TextInput
              placeholder="Search categories by name, slug, description..."
              placeholderTextColor={colors.mutedText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoCapitalize="none"
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.mutedText} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            style={[styles.sortButton, sortBy !== "name_asc" && styles.sortButtonActive]}
            onPress={() => {
              setSortBy((prev) => (prev === "name_asc" ? "name_desc" : prev === "name_desc" ? "newest" : "name_asc"));
            }}
          >
            <Ionicons
              name="swap-vertical"
              size={18}
              color={sortBy !== "name_asc" ? colors.background : colors.primaryText}
            />
            <Text style={[styles.sortButtonText, sortBy !== "name_asc" && styles.sortButtonTextActive]}>
              {sortBy === "name_asc" ? "A-Z" : sortBy === "name_desc" ? "Z-A" : "Newest"}
            </Text>
          </Pressable>
        </View>
      </View>

      {status === "loading" ? <LoadingIndicator fullscreen={false} /> : null}
      {status === "error" ? <ErrorState message={error ?? undefined} onRetry={load} /> : null}
      {status === "success" && processedCategories.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching categories found" : "No categories yet"}
          actionLabel={searchQuery ? "Clear Search" : "Add Category"}
          onAction={searchQuery ? () => setSearchQuery("") : openAddModal}
        />
      ) : null}

      {status === "success" && processedCategories.length > 0 ? (
        <FlatList
          data={processedCategories}
          keyExtractor={(c) => c._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const hasImage = Boolean(item.image && item.image.trim());
            return (
              <View style={styles.card}>
                <View style={styles.thumbWrapper}>
                  {hasImage ? (
                    <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View style={styles.placeholderThumb}>
                      <Ionicons name="grid-outline" size={24} color={colors.mutedText} />
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.slugBadge}>
                      <Text style={styles.slugText}>/{item.slug}</Text>
                    </View>
                  </View>
                  {item.description ? (
                    <Text style={styles.description} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : (
                    <Text style={styles.noDescription}>No description provided</Text>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <Pressable onPress={() => openEditModal(item)} hitSlop={8} style={styles.actionIconBtn}>
                    <Ionicons name="create-outline" size={20} color={colors.accent} />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item._id, item.name)} hitSlop={8} style={styles.actionIconBtn}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      ) : null}

      {/* Add / Edit Category Modal */}
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{editingId ? "Edit Category" : "Add New Category"}</Text>
          <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>

        <ScrollView
          style={{ maxHeight: 500 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          <Input
            label="Category Name *"
            value={name}
            onChangeText={handleNameChange}
            error={formErrors.name}
            placeholder="e.g. Titanium Rings, Leather Wallets"
          />

          <Input
            label="URL Slug Identifier *"
            value={slug}
            onChangeText={setSlug}
            error={formErrors.slug}
            placeholder="e.g. titanium-rings"
            autoCapitalize="none"
          />

          <Input
            label="Cover / Banner Image URL"
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://images.unsplash.com/..."
          />

          {imageUrl.trim() ? (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Image Preview</Text>
              <Image source={{ uri: imageUrl.trim() }} style={styles.previewImage} contentFit="cover" />
            </View>
          ) : null}

          <Input
            label="Category Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholder="Aerospace-grade jewelry crafted for daily elegance..."
          />

          <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
            <Button
              label={editingId ? "Save Category Changes" : "Create Category"}
              onPress={handleSaveCategory}
              loading={saving}
            />
            <Button label="Cancel" variant="ghost" onPress={() => setModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topControlSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBarRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.primaryText,
    ...typography.bodySmall,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  sortButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sortButtonText: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: "600",
  },
  sortButtonTextActive: {
    color: colors.background,
    fontWeight: "700",
  },
  list: { padding: spacing.md },
  addButton: {
    padding: spacing.xs,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  thumbWrapper: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  placeholderThumb: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  name: { ...typography.body, color: colors.primaryText, fontWeight: "600" },
  slugBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  slugText: { ...typography.caption, fontSize: 10, color: colors.accent, fontWeight: "600" },
  description: { ...typography.caption, color: colors.secondaryText, marginTop: 2, lineHeight: 16 },
  noDescription: { ...typography.caption, color: colors.mutedText, marginTop: 2, fontStyle: "italic" },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  actionIconBtn: {
    padding: spacing.xs,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  modalTitle: { ...typography.h2, color: colors.primaryText },
  previewContainer: {
    marginVertical: spacing.xs,
  },
  previewLabel: {
    ...typography.caption,
    color: colors.mutedText,
    textTransform: "uppercase",
    fontSize: 10,
    marginBottom: 4,
  },
  previewImage: {
    width: "100%",
    height: 120,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
});
