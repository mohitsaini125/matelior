import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/constants/colors";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { isValidPhone } from "@/utils/validation";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Enter your full name";
    if (phone && !isValidPhone(phone)) nextErrors.phone = "Enter a valid phone number";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await authService.updateProfile({ name, phone });
      await refreshUser();
      router.back();
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ScreenHeader title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Full Name" value={name} onChangeText={setName} error={errors.name} />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />
        <Button label="Save Changes" onPress={handleSave} loading={saving} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
});
