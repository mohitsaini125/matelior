import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@/constants/colors";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { isValidEmail } from "@/utils/validation";
import { ROUTES } from "@/constants/routes";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address";
    if (password.length === 0) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await login({ email, password });
      router.replace(ROUTES.home as never);
    } catch (err) {
      Alert.alert("Login failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>MATELIOR</Text>
      <Text style={styles.heading}>Welcome back</Text>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      <Button label="Log In" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      <View style={styles.footer}>
        <Text style={styles.footerText} onPress={() => router.push(ROUTES.forgotPassword as never)}>
          Forgot password?
        </Text>
        <Text style={styles.footerText} onPress={() => router.push(ROUTES.register as never)}>
          Create an account
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  brand: { ...typography.h2, color: colors.silver, letterSpacing: 3, textAlign: "center", marginBottom: spacing.xl },
  heading: { ...typography.h1, color: colors.primaryText, marginBottom: spacing.lg },
  footer: { marginTop: spacing.lg, gap: spacing.md, alignItems: "center" },
  footerText: { ...typography.bodySmall, color: colors.secondaryText, textDecorationLine: "underline" },
});
