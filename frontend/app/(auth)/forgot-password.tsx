import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@/constants/colors";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { isValidEmail } from "@/utils/validation";
import { api } from "@/services/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await api.post("/user/forgot-password", { email }, { authenticated: false });
      setSent(true);
    } catch (err) {
      Alert.alert("Something went wrong", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Reset your password</Text>
      {sent ? (
        <Text style={styles.body}>
          If an account exists for {email}, a reset link has been sent.
        </Text>
      ) : (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={error}
          />
          <Button label="Send Reset Link" onPress={handleSubmit} loading={loading} />
        </>
      )}
      <Text style={styles.footerText} onPress={() => router.back()}>
        Back to login
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  heading: { ...typography.h1, color: colors.primaryText, marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.secondaryText, marginBottom: spacing.lg },
  footerText: {
    ...typography.bodySmall,
    color: colors.secondaryText,
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
