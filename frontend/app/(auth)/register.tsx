import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@/constants/colors";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { isValidEmail, isValidPassword, isValidPhone } from "@/utils/validation";
import { ROUTES } from "@/constants/routes";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Enter your full name";
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address";
    if (phone && !isValidPhone(phone)) nextErrors.phone = "Enter a valid phone number";
    if (!isValidPassword(password)) nextErrors.password = "Password must be at least 8 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      // role is never sent by the client — backend defaults new users to "customer"
      await register({ name, email, password, phone: phone || undefined });
      router.replace(ROUTES.home as never);
    } catch (err) {
      Alert.alert("Registration failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Create your account</Text>
      <Input label="Full name" value={name} onChangeText={setName} error={errors.name} />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />
      <Input label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
      <Button label="Create Account" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      <Text style={styles.footerText} onPress={() => router.push(ROUTES.login as never)}>
        Already have an account? Log in
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  heading: { ...typography.h1, color: colors.primaryText, marginBottom: spacing.lg },
  footerText: {
    ...typography.bodySmall,
    color: colors.secondaryText,
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
