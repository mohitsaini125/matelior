import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { EmptyState } from "@/components/common/EmptyState";
import { addressService } from "@/services/address.service";
import { Address, AddressInput } from "@/types/address";
import { ROUTES } from "@/constants/routes";
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

export default function CheckoutAddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // Add Address Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function load() {
    setStatus("loading");
    addressService
      .list()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAddresses(list);
        if (list.length > 0) {
          setSelectedId(list.find((a) => a.isDefault)?._id ?? list[0]._id);
        } else {
          setSelectedId(null);
        }
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
    setErrors({});
    setModalVisible(true);
  }

  async function handleCreateAddress() {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!isValidPhone(form.phone)) nextErrors.phone = "Enter a valid phone number";
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = "Street address is required";
    if (!form.city.trim()) nextErrors.city = "City is required";
    if (!form.state.trim()) nextErrors.state = "State is required";
    if (!isValidPostalCode(form.postalCode)) nextErrors.postalCode = "Enter a valid 6-digit postal code";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const created = await addressService.create(form);
      setModalVisible(false);
      const updatedList = await addressService.list();
      setAddresses(updatedList);
      setSelectedId(created._id);
    } catch (err) {
      Alert.alert("Failed to save address", err instanceof Error ? err.message : "Please check your details and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Delivery Address" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stage}>Step 2 of 3 · Select Shipping Destination</Text>
        {status === "loading" ? <LoadingIndicator fullscreen={false} /> : null}

        {status === "success" && addresses.length === 0 ? (
          <EmptyState
            title="No saved addresses"
            message="Add an address below to proceed with your order."
            actionLabel="Add Shipping Address"
            onAction={openAddModal}
          />
        ) : null}

        {status === "success" && addresses.length > 0 ? (
          <>
            <AddressSelector addresses={addresses} selectedId={selectedId} onSelect={setSelectedId} />
            <Button
              label="+ Add Another Address"
              variant="outline"
              onPress={openAddModal}
              style={{ marginTop: spacing.md }}
            />
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue to Payment →"
          disabled={!selectedId}
          onPress={() => {
            if (selectedId) {
              router.push({ pathname: ROUTES.checkoutPayment, params: { addressId: selectedId } } as never);
            }
          }}
        />
      </View>

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Shipping Address</Text>
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
          <Input label="Full Name" value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} error={errors.fullName} placeholder="Mohit Saini" />
          <Input label="Phone Number" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" error={errors.phone} placeholder="9876543210" />
          <Input label="Address Line 1" value={form.addressLine1} onChangeText={(v) => setForm({ ...form, addressLine1: v })} error={errors.addressLine1} placeholder="Flat, House no., Building" />
          <Input label="Address Line 2 (Optional)" value={form.addressLine2} onChangeText={(v) => setForm({ ...form, addressLine2: v })} placeholder="Area, Colony, Landmark" />
          <Input label="City" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} error={errors.city} placeholder="New Delhi" />
          <Input label="State" value={form.state} onChangeText={(v) => setForm({ ...form, state: v })} error={errors.state} placeholder="Delhi" />
          <Input label="Postal Code / PIN" value={form.postalCode} onChangeText={(v) => setForm({ ...form, postalCode: v })} keyboardType="numeric" error={errors.postalCode} placeholder="110001" />
          <Input label="Country" value={form.country} onChangeText={(v) => setForm({ ...form, country: v })} error={errors.country} placeholder="India" />
          <View style={styles.modalActions}>
            <Button label="Save & Use Address" onPress={handleCreateAddress} loading={saving} />
            <Button label="Cancel" variant="ghost" onPress={() => setModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  stage: { ...typography.caption, color: colors.accent, marginBottom: spacing.md, textTransform: "uppercase", letterSpacing: 0.5 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  modalTitle: { ...typography.h2, color: colors.primaryText },
  closeBtn: { padding: spacing.xs },
  modalScroll: { maxHeight: 500 },
  modalScrollContent: { paddingBottom: spacing.xl },
  modalActions: { marginTop: spacing.md, gap: spacing.xs },
});
