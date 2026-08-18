import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { EmptyState } from "@/components/common/EmptyState";
import { addressService } from "@/services/address.service";
import { Address, AddressInput } from "@/types/address";
import { isValidPhone, isValidPostalCode } from "@/utils/validation";

const EMPTY_FORM: AddressInput = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function load() {
    setStatus("loading");
    addressService
      .list()
      .then((data) => {
        setAddresses(Array.isArray(data) ? data : []);
        setStatus("success");
      })
      .catch(() => {
        setAddresses([]);
        setStatus("success");
      });
  }

  useEffect(load, []);

  function openAddModal() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setModalVisible(true);
  }

  function openEditModal(address: Address) {
    setForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || address.pincode || "",
      country: address.country || "India",
      isDefault: address.isDefault ?? false,
    });
    setEditingId(address._id);
    setErrors({});
    setModalVisible(true);
  }

  async function handleSave() {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!isValidPhone(form.phone)) nextErrors.phone = "Enter a valid phone number";
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = "Street address is required";
    if (!form.city.trim()) nextErrors.city = "City is required";
    if (!form.state.trim()) nextErrors.state = "State is required";
    if (!isValidPostalCode(form.postalCode)) nextErrors.postalCode = "Enter a valid 6-digit postal code";
    if (!form.country.trim()) nextErrors.country = "Country is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      if (editingId) {
        await addressService.update(editingId, form);
      } else {
        await addressService.create(form);
      }
      setModalVisible(false);
      load();
    } catch (err) {
      Alert.alert("Couldn't save address", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    Alert.alert("Delete address", "Are you sure you want to remove this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await addressService.remove(id);
            load();
          } catch (err) {
            Alert.alert("Delete failed", err instanceof Error ? err.message : "Try again");
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Saved Addresses" />
      {status === "loading" ? <LoadingIndicator fullscreen={false} /> : null}
      {status === "success" && addresses.length === 0 ? (
        <EmptyState title="No addresses saved" actionLabel="Add Address" onAction={openAddModal} />
      ) : null}
      {status === "success" && addresses.length > 0 ? (
        <FlatList
          data={addresses}
          keyExtractor={(a) => a._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const postal = item.postalCode || item.pincode || "";
            return (
              <View style={styles.card}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  {item.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.line}>
                  {item.addressLine1}
                  {item.addressLine2 ? `, ${item.addressLine2}` : ""}
                </Text>
                <Text style={styles.line}>
                  {item.city}, {item.state} {postal}
                </Text>
                <Text style={styles.phone}>Phone: {item.phone}</Text>
                <View style={styles.cardActions}>
                  <Pressable onPress={() => openEditModal(item)} hitSlop={8}>
                    <Text style={styles.link}>Edit Address</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item._id)} hitSlop={8}>
                    <Text style={styles.linkDelete}>Delete</Text>
                  </Pressable>
                  {!item.isDefault ? (
                    <Pressable
                      onPress={() =>
                        addressService
                          .setDefault(item._id)
                          .then(load)
                          .catch((err) => Alert.alert("Error", err.message))
                      }
                      hitSlop={8}
                    >
                      <Text style={styles.linkDefault}>Set as Default</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <Button
              label="+ Add New Address"
              variant="outline"
              onPress={openAddModal}
              style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}
            />
          }
        />
      ) : null}

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{editingId ? "Edit Address" : "Add Address"}</Text>
          <Pressable onPress={() => setModalVisible(false)} hitSlop={10} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.mutedText} />
          </Pressable>
        </View>
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Full Name"
            value={form.fullName}
            onChangeText={(v) => setForm({ ...form, fullName: v })}
            error={errors.fullName}
            placeholder="Mohit Saini"
          />
          <Input
            label="Phone Number"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
            error={errors.phone}
            placeholder="9876543210"
          />
          <Input
            label="Address Line 1"
            value={form.addressLine1}
            onChangeText={(v) => setForm({ ...form, addressLine1: v })}
            error={errors.addressLine1}
            placeholder="Flat, House no., Street, Area"
          />
          <Input
            label="Address Line 2 (Optional)"
            value={form.addressLine2}
            onChangeText={(v) => setForm({ ...form, addressLine2: v })}
            placeholder="Apartment, suite, landmark"
          />
          <Input
            label="City"
            value={form.city}
            onChangeText={(v) => setForm({ ...form, city: v })}
            error={errors.city}
            placeholder="New Delhi"
          />
          <Input
            label="State"
            value={form.state}
            onChangeText={(v) => setForm({ ...form, state: v })}
            error={errors.state}
            placeholder="Delhi"
          />
          <Input
            label="Postal Code / PIN"
            value={form.postalCode}
            onChangeText={(v) => setForm({ ...form, postalCode: v })}
            keyboardType="numeric"
            error={errors.postalCode}
            placeholder="110001"
          />
          <Input
            label="Country"
            value={form.country}
            onChangeText={(v) => setForm({ ...form, country: v })}
            error={errors.country}
            placeholder="India"
          />
          <View style={styles.modalActions}>
            <Button
              label={editingId ? "Save Changes" : "Save Address"}
              onPress={handleSave}
              loading={saving}
            />
            <Button
              label="Cancel"
              variant="ghost"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: { ...typography.body, color: colors.primaryText, fontWeight: "600" },
  line: { ...typography.bodySmall, color: colors.secondaryText, marginTop: 1 },
  phone: { ...typography.caption, color: colors.mutedText, marginTop: 2 },
  defaultBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  defaultText: { ...typography.caption, color: colors.accent, fontSize: 9, fontWeight: "700" },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  link: { ...typography.bodySmall, color: colors.accent, fontWeight: "600" },
  linkDelete: { ...typography.bodySmall, color: colors.error },
  linkDefault: { ...typography.bodySmall, color: colors.mutedText, textDecorationLine: "underline" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  modalTitle: { ...typography.h2, color: colors.primaryText },
  closeBtn: { padding: spacing.xs },
  modalScroll: { maxHeight: 520 },
  modalScrollContent: { paddingBottom: spacing.xl },
  modalActions: { marginTop: spacing.md, gap: spacing.xs },
});
