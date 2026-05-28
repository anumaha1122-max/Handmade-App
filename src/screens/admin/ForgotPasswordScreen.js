import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../config/api";

const C = {
  primary: "#0e3243",
  accent: "#1a9e6e",
  white: "#FFFFFF",
  bg: "#f4f6f9",
  text: "#0e3243",
  muted: "#7a93a0",
  border: "#e2eaf0",
  red: "#e74c3c",
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }
      if (response.ok) {
        Alert.alert(
          "Success",
          data?.message || "Password reset instructions have been sent to your email."
        );
        navigation.replace("AdminLoginScreen");
      } else {
        Alert.alert(
          "Failed",
          data?.message || data?.error || "Unable to process password reset."
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      Alert.alert("Error", "Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.topSection}>
            <View style={styles.logoWrap}>
              <Ionicons name="shield-checkmark" size={48} color={C.white} />
            </View>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your admin email to receive reset instructions.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={C.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="admin@example.com"
                  placeholderTextColor={C.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={loading}
            >
              <Ionicons name="mail-outline" size={20} color={C.white} />
              <Text style={styles.submitBtnText}>{loading ? "Sending..." : "Send Reset Link"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
              <Text style={styles.backLinkText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  topSection: { alignItems: "center", paddingTop: 60, paddingBottom: 40, backgroundColor: C.primary },
  logoWrap: { backgroundColor: "rgba(255,255,255,0.15)", width: 90, height: 90, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { color: C.white, fontSize: 26, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 },
  card: { backgroundColor: C.white, borderRadius: 28, padding: 28, margin: 20, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, elevation: 10 },
  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: C.text, marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 14, color: C.text },
  submitBtn: { backgroundColor: C.primary, borderRadius: 14, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 },
  submitBtnText: { color: C.white, fontSize: 16, fontWeight: "800" },
  backLink: { marginTop: 20, alignSelf: "center" },
  backLinkText: { color: C.accent, fontSize: 14, fontWeight: "600" },
});
