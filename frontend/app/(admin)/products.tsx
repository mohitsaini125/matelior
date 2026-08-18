import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { Product, ProductStatus } from "@/types/product";
import { Category } from "@/types/category";
import { formatPrice } from "@/utils/formatPrice";
import { resolveProductImageUrl } from "@/utils/imageUrl";

const MATERIALS = ["leather", "titanium", "stainless steel", "rope", "alloy"];
const STATUSES: ProductStatus[] = ["active", "hidden"];

type SortOption = "newest" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc" | "name_asc";
type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

export default function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  // Search, Sort & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMaterial, setFilterMaterial] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<StockFilter>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Product Edit / Add Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [stock, setStock] = useState("10");
  const [sku, setSku] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [material, setMaterial] = useState("leather");
  const [color, setColor] = useState("");
  const [productStatus, setProductStatus] = useState<ProductStatus>("active");
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function load() {
    setStatus("loading");
    Promise.all([productService.list({ limit: 100 }), categoryService.list()])
      .then(([prodData, catData]) => {
        setProducts(prodData.items || []);
        setCategories(catData || []);
        if (catData && catData.length > 0 && !selectedCategory) {
          setSelectedCategory(catData[0]._id);
        }
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load products");
        setStatus("error");
      });
  }

  useEffect(load, []);

  function openAddModal() {
    setEditingId(null);
    setName("");
    setPrice("");
    setDiscountPercent("0");
    setStock("10");
    setSku(`MAT-${Math.floor(1000 + Math.random() * 9000)}`);
    if (categories.length > 0) setSelectedCategory(categories[0]._id);
    setMaterial("leather");
    setColor("");
    setProductStatus("active");
    setDescription("");
    setMainImage("");
    setAdditionalImages([]);
    setFormErrors({});
    setModalVisible(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product._id);
    setName(product.name || "");
    setPrice(String(product.price || ""));
    setDiscountPercent(String(product.discountPercent || "0"));
    setStock(String(product.stock ?? 0));
    setSku(product.sku || "");
    const catId = typeof product.category === "object" ? (product.category as any)?._id : product.category;
    setSelectedCategory(catId || (categories[0]?._id ?? ""));
    setMaterial(product.material || "leather");
    setColor(product.color || ((product as any).colors?.[0] ?? ""));
    setProductStatus(product.status || "active");
    setDescription(product.description || "");

    const imgs = product.images || [];
    setMainImage(imgs[0] || "");
    setAdditionalImages(imgs.slice(1));

    setFormErrors({});
    setModalVisible(true);
  }

  function handleAddImageField() {
    setAdditionalImages((prev) => [...prev, ""]);
  }

  function handleUpdateAdditionalImage(index: number, value: string) {
    setAdditionalImages((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  function handleRemoveAdditionalImage(index: number) {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveProduct() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Product name is required";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) nextErrors.price = "Enter a valid price";
    if (!selectedCategory) nextErrors.category = "Select a category";
    if (stock === "" || isNaN(Number(stock)) || Number(stock) < 0) nextErrors.stock = "Enter valid stock";
    if (discountPercent && (isNaN(Number(discountPercent)) || Number(discountPercent) < 0 || Number(discountPercent) > 100)) {
      nextErrors.discountPercent = "Discount must be between 0 and 100";
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const allImages = [
      mainImage.trim(),
      ...additionalImages.map((img) => img.trim()).filter(Boolean),
    ].filter(Boolean);

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        price: Number(price),
        discountPercent: Number(discountPercent) || 0,
        stock: Number(stock),
        sku: sku.trim() || undefined,
        category: selectedCategory as any,
        material: material as any,
        color: color.trim() || undefined,
        description: description.trim() || undefined,
        images: allImages,
        status: productStatus,
      };

      if (editingId) {
        await productService.update(editingId, payload);
      } else {
        await productService.create(payload);
      }

      setModalVisible(false);
      load();
    } catch (err) {
      Alert.alert("Save Failed", err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    Alert.alert("Delete Product", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await productService.remove(id);
            load();
          } catch (err) {
            Alert.alert("Delete failed", err instanceof Error ? err.message : "Try again");
          }
        },
      },
    ]);
  }

  function resetFilters() {
    setFilterCategory("all");
    setFilterMaterial("all");
    setFilterStock("all");
    setFilterStatus("all");
    setSortBy("newest");
    setSearchQuery("");
  }

  const hasActiveFilters =
    filterCategory !== "all" ||
    filterMaterial !== "all" ||
    filterStock !== "all" ||
    filterStatus !== "all" ||
    sortBy !== "newest" ||
    searchQuery.trim().length > 0;

  const processedProducts = useMemo(() => {
    let list = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const catName = typeof p.category === "object" ? (p.category as any)?.name : "";
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (catName && catName.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q)) ||
          (p.color && p.color.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      });
    }

    // Category Filter
    if (filterCategory !== "all") {
      list = list.filter((p) => {
        const catId = typeof p.category === "object" ? (p.category as any)?._id : p.category;
        return catId === filterCategory;
      });
    }

    // Material Filter
    if (filterMaterial !== "all") {
      list = list.filter((p) => p.material && p.material.toLowerCase() === filterMaterial.toLowerCase());
    }

    // Stock Filter
    if (filterStock === "in_stock") {
      list = list.filter((p) => p.stock > 0);
    } else if (filterStock === "low_stock") {
      list = list.filter((p) => p.stock > 0 && p.stock < 10);
    } else if (filterStock === "out_of_stock") {
      list = list.filter((p) => p.stock === 0);
    }

    // Status Filter
    if (filterStatus !== "all") {
      list = list.filter((p) => p.status === filterStatus);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock_asc") return a.stock - b.stock;
      if (sortBy === "stock_desc") return b.stock - a.stock;
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      // default "newest"
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }, [products, searchQuery, filterCategory, filterMaterial, filterStock, filterStatus, sortBy]);

  const allPreviewImages = [
    mainImage.trim(),
    ...additionalImages.map((s) => s.trim()).filter(Boolean),
  ].filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Products Management"
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
              placeholder="Search by name, SKU, material, category..."
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
            style={[styles.filterButton, (filterCategory !== "all" || filterMaterial !== "all" || filterStock !== "all" || filterStatus !== "all" || sortBy !== "newest") && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={
                filterCategory !== "all" || filterMaterial !== "all" || filterStock !== "all" || filterStatus !== "all" || sortBy !== "newest"
                  ? colors.background
                  : colors.primaryText
              }
            />
            <Text
              style={[
                styles.filterButtonText,
                (filterCategory !== "all" || filterMaterial !== "all" || filterStock !== "all" || filterStatus !== "all" || sortBy !== "newest") && styles.filterButtonTextActive,
              ]}
            >
              Filter & Sort
            </Text>
          </Pressable>
        </View>

        {/* Quick Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {hasActiveFilters ? (
            <Pressable style={styles.resetChip} onPress={resetFilters}>
              <Ionicons name="refresh" size={12} color={colors.error} />
              <Text style={styles.resetChipText}>Reset All</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={[styles.quickChip, filterStock === "in_stock" && styles.quickChipActive]}
            onPress={() => setFilterStock(filterStock === "in_stock" ? "all" : "in_stock")}
          >
            <Text style={[styles.quickChipText, filterStock === "in_stock" && styles.quickChipTextActive]}>
              In Stock
            </Text>
          </Pressable>

          <Pressable
            style={[styles.quickChip, filterStock === "low_stock" && styles.quickChipActive]}
            onPress={() => setFilterStock(filterStock === "low_stock" ? "all" : "low_stock")}
          >
            <Text style={[styles.quickChipText, filterStock === "low_stock" && styles.quickChipTextActive]}>
              Low Stock (&lt;10)
            </Text>
          </Pressable>

          <Pressable
            style={[styles.quickChip, filterStock === "out_of_stock" && styles.quickChipActive]}
            onPress={() => setFilterStock(filterStock === "out_of_stock" ? "all" : "out_of_stock")}
          >
            <Text style={[styles.quickChipText, filterStock === "out_of_stock" && styles.quickChipTextActive]}>
              Out of Stock
            </Text>
          </Pressable>

          {categories.map((c) => (
            <Pressable
              key={c._id}
              style={[styles.quickChip, filterCategory === c._id && styles.quickChipActive]}
              onPress={() => setFilterCategory(filterCategory === c._id ? "all" : c._id)}
            >
              <Text style={[styles.quickChipText, filterCategory === c._id && styles.quickChipTextActive]}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {status === "loading" ? <LoadingIndicator fullscreen={false} /> : null}
      {status === "error" ? <ErrorState message={error ?? undefined} onRetry={load} /> : null}
      {status === "success" && processedProducts.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No products match criteria" : "No products yet"}
          actionLabel={hasActiveFilters ? "Reset Filters" : "Add Product"}
          onAction={hasActiveFilters ? resetFilters : openAddModal}
        />
      ) : null}

      {status === "success" && processedProducts.length > 0 ? (
        <FlatList
          data={processedProducts}
          keyExtractor={(p) => p._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const categoryName = typeof item.category === "object" ? (item.category as any)?.name : item.category;
            const img = resolveProductImageUrl(item);
            const imgCount = (item.images || []).length;
            return (
              <View style={styles.row}>
                <View style={{ position: "relative" }}>
                  <Image source={{ uri: img }} style={styles.thumb} contentFit="cover" />
                  {imgCount > 1 ? (
                    <View style={styles.imgCountBadge}>
                      <Text style={styles.imgCountText}>{imgCount}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    {item.status === "hidden" ? (
                      <View style={styles.hiddenBadge}>
                        <Text style={styles.hiddenText}>HIDDEN</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.meta}>
                    {item.sku || "NO-SKU"} · {categoryName || "Uncategorized"} · Stock: {item.stock}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatPrice(item.price)}</Text>
                    {item.discountPercent ? (
                      <Text style={styles.discountBadge}>{item.discountPercent}% OFF</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.rowActions}>
                  <Pressable onPress={() => openEditModal(item)} hitSlop={8} style={styles.actionIconBtn}>
                    <Ionicons name="create-outline" size={20} color={colors.accent} />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item._id)} hitSlop={8} style={styles.actionIconBtn}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      ) : null}

      {/* Filter & Sort Bottom Sheet Modal */}
      <Modal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter & Sort Products</Text>
          <Pressable onPress={() => setFilterModalVisible(false)} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>

        <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
          <Text style={styles.inputLabel}>Sort By</Text>
          <View style={styles.categoryPills}>
            {[
              { id: "newest", label: "Newest First" },
              { id: "price_asc", label: "Price: Low to High" },
              { id: "price_desc", label: "Price: High to Low" },
              { id: "stock_asc", label: "Stock: Low to High" },
              { id: "stock_desc", label: "Stock: High to Low" },
              { id: "name_asc", label: "Name: A to Z" },
            ].map((s) => (
              <Pressable
                key={s.id}
                style={[styles.pill, sortBy === s.id && styles.pillActive]}
                onPress={() => setSortBy(s.id as SortOption)}
              >
                <Text style={[styles.pillText, sortBy === s.id && styles.pillTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Filter By Category</Text>
          <View style={styles.categoryPills}>
            <Pressable
              style={[styles.pill, filterCategory === "all" && styles.pillActive]}
              onPress={() => setFilterCategory("all")}
            >
              <Text style={[styles.pillText, filterCategory === "all" && styles.pillTextActive]}>All Categories</Text>
            </Pressable>
            {categories.map((c) => (
              <Pressable
                key={c._id}
                style={[styles.pill, filterCategory === c._id && styles.pillActive]}
                onPress={() => setFilterCategory(c._id)}
              >
                <Text style={[styles.pillText, filterCategory === c._id && styles.pillTextActive]}>{c.name}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Filter By Material</Text>
          <View style={styles.categoryPills}>
            <Pressable
              style={[styles.pill, filterMaterial === "all" && styles.pillActive]}
              onPress={() => setFilterMaterial("all")}
            >
              <Text style={[styles.pillText, filterMaterial === "all" && styles.pillTextActive]}>All Materials</Text>
            </Pressable>
            {MATERIALS.map((m) => (
              <Pressable
                key={m}
                style={[styles.pill, filterMaterial === m && styles.pillActive]}
                onPress={() => setFilterMaterial(m)}
              >
                <Text style={[styles.pillText, filterMaterial === m && styles.pillTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Filter By Status</Text>
          <View style={styles.categoryPills}>
            <Pressable
              style={[styles.pill, filterStatus === "all" && styles.pillActive]}
              onPress={() => setFilterStatus("all")}
            >
              <Text style={[styles.pillText, filterStatus === "all" && styles.pillTextActive]}>All Statuses</Text>
            </Pressable>
            {STATUSES.map((st) => (
              <Pressable
                key={st}
                style={[styles.pill, filterStatus === st && styles.pillActive]}
                onPress={() => setFilterStatus(st)}
              >
                <Text style={[styles.pillText, filterStatus === st && styles.pillTextActive]}>{st.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
            <Button label="Apply Filters" onPress={() => setFilterModalVisible(false)} />
            <Button label="Reset All Filters" variant="outline" onPress={resetFilters} />
          </View>
        </ScrollView>
      </Modal>

      {/* Edit / Add Product Modal */}
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{editingId ? "Edit Product" : "Add New Product"}</Text>
          <Pressable onPress={() => setModalVisible(false)} hitSlop={10} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.modalScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <Input label="Product Name *" value={name} onChangeText={setName} error={formErrors.name} placeholder="e.g. Matte Titanium Ring" />
          <Input label="Price (₹) *" value={price} onChangeText={setPrice} keyboardType="numeric" error={formErrors.price} placeholder="e.g. 799" />
          <Input label="Discount Percentage (0-100%)" value={discountPercent} onChangeText={setDiscountPercent} keyboardType="numeric" error={formErrors.discountPercent} placeholder="0" />
          <Input label="Stock Quantity *" value={stock} onChangeText={setStock} keyboardType="numeric" error={formErrors.stock} placeholder="10" />
          <Input label="SKU Code" value={sku} onChangeText={setSku} placeholder="e.g. MTR-02" />
          
          <Text style={styles.inputLabel}>Category *</Text>
          <View style={styles.categoryPills}>
            {categories.map((c) => (
              <Pressable
                key={c._id}
                style={[styles.pill, selectedCategory === c._id && styles.pillActive]}
                onPress={() => setSelectedCategory(c._id)}
              >
                <Text style={[styles.pillText, selectedCategory === c._id && styles.pillTextActive]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Material</Text>
          <View style={styles.categoryPills}>
            {MATERIALS.map((m) => (
              <Pressable
                key={m}
                style={[styles.pill, material === m && styles.pillActive]}
                onPress={() => setMaterial(m)}
              >
                <Text style={[styles.pillText, material === m && styles.pillTextActive]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Listing Status</Text>
          <View style={styles.categoryPills}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                style={[styles.pill, productStatus === s && styles.pillActive]}
                onPress={() => setProductStatus(s)}
              >
                <Text style={[styles.pillText, productStatus === s && styles.pillTextActive]}>
                  {s.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input label="Color / Finish" value={color} onChangeText={setColor} placeholder="e.g. Matte Black, Brushed Gold" />
          
          {/* Main Image URL */}
          <Text style={styles.inputLabel}>Main / Primary Image URL</Text>
          <Input
            value={mainImage}
            onChangeText={setMainImage}
            placeholder="https://images.unsplash.com/... (Primary cover image)"
          />

          {/* Dynamic Additional Images */}
          <View style={styles.additionalImagesSection}>
            <View style={styles.additionalImagesHeader}>
              <Text style={styles.inputLabel}>Additional Images (Slide Right)</Text>
              <Pressable
                style={styles.addMoreBtn}
                onPress={handleAddImageField}
                hitSlop={8}
              >
                <Ionicons name="add-circle" size={16} color={colors.accent} />
                <Text style={styles.addMoreBtnText}>+ Add More Image</Text>
              </Pressable>
            </View>

            {additionalImages.map((url, idx) => (
              <View key={idx} style={styles.additionalImageRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label={`Image #${idx + 2} URL`}
                    value={url}
                    onChangeText={(text) => handleUpdateAdditionalImage(idx, text)}
                    placeholder={`https://images.unsplash.com/... (Angle #${idx + 2})`}
                  />
                </View>
                <Pressable
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveAdditionalImage(idx)}
                  hitSlop={10}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </Pressable>
              </View>
            ))}
          </View>

          {/* Live Image Previews */}
          {allPreviewImages.length > 0 ? (
            <View style={styles.previewSection}>
              <Text style={styles.inputLabel}>Gallery Preview ({allPreviewImages.length} images)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewStrip}>
                {allPreviewImages.map((uri, idx) => (
                  <View key={idx} style={styles.previewCard}>
                    <Image source={{ uri }} style={styles.previewThumb} contentFit="cover" />
                    <View style={styles.previewBadge}>
                      <Text style={styles.previewBadgeText}>{idx === 0 ? "MAIN" : `#${idx + 1}`}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <Input label="Product Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholder="Handcrafted luxury accessory..." />
          
          <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
            <Button label={editingId ? "Save Product Changes" : "Create Product"} onPress={handleSaveProduct} loading={saving} />
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBarRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: colors.background,
    fontWeight: "700",
  },
  chipsScroll: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  resetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: "rgba(220, 53, 69, 0.15)",
    borderWidth: 1,
    borderColor: colors.error,
  },
  resetChipText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.error,
    fontWeight: "700",
  },
  quickChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipActive: {
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderColor: colors.accent,
  },
  quickChipText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.secondaryText,
    fontWeight: "600",
  },
  quickChipTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  list: { padding: spacing.md },
  addButton: {
    padding: spacing.xs,
  },
  row: {
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
  thumb: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imgCountBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  imgCountText: {
    ...typography.caption,
    color: colors.background,
    fontSize: 9,
    fontWeight: "700",
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  name: { ...typography.body, color: colors.primaryText, fontWeight: "600", flex: 1 },
  hiddenBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  hiddenText: { ...typography.caption, fontSize: 8, color: colors.mutedText, fontWeight: "700" },
  meta: { ...typography.caption, color: colors.mutedText, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 2 },
  price: { ...typography.bodySmall, color: colors.accent, fontWeight: "700" },
  discountBadge: { ...typography.caption, color: colors.success, fontSize: 10, fontWeight: "700" },
  rowActions: {
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
  closeBtn: {
    padding: spacing.xs,
  },
  modalScroll: {
    maxHeight: 540,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.mutedText,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  categoryPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
  },
  pillText: {
    ...typography.caption,
    color: colors.secondaryText,
    textTransform: "capitalize",
  },
  pillTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  additionalImagesSection: {
    marginVertical: spacing.xs,
  },
  additionalImagesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
  },
  addMoreBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "700",
  },
  additionalImageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  removeImageBtn: {
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
  previewSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  previewStrip: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  previewCard: {
    position: "relative",
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
  },
  previewThumb: {
    width: "100%",
    height: "100%",
  },
  previewBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingVertical: 1,
    alignItems: "center",
  },
  previewBadgeText: {
    ...typography.caption,
    fontSize: 8,
    color: colors.accent,
    fontWeight: "700",
  },
});
