// src/screens/admin/AdminLoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../config/api"; // adjusted path
import { useShop } from "../../context/ShopContext";

const C = {
  primary: "#082843",
  primary2: "#001B36",
  white: "#FFFFFF",
  bg: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  soft: "#F1F5F9",
  gold: "#F6C344",
  danger: "#EF4444",
};

export default function AdminLoginScreen({ navigation }) {
  const { setAuthToken, setCurrentAdmin } = useShop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter admin email.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthToken(data.token);
        setCurrentAdmin(data.data);
        navigation.replace("AdminTabs");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.topHeader}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-outline" size={76} color={C.white} />
              <Ionicons name="person" size={31} color={C.white} style={styles.logoPerson} />
              <Ionicons name="priceless" size={27} color={C.gold} style={styles.logoCrown} />
            </View>
            <Text style={styles.title}>Admin Login</Text>
            <Text style={styles.subtitle}>Welcome back! Please sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputBox}>
              <View style={styles.inputIconBox}>
                <Ionicons name="mail-outline" size={24} color={C.primary} />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter admin email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <Text style={[styles.label, { marginTop: 22 }]}>Password</Text>
            <View style={styles.inputBox}>
              <View style={styles.inputIconBox}>
                <Ionicons name="lock-closed-outline" size={24} color={C.primary} />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={28} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember((v) => !v)}>
                <View style={[styles.checkBox, remember && styles.checkedBox]}>
                  {remember && <Ionicons name="checkmark" size={18} color={C.white} />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goForgotPassword} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.loginBtn}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={loading}
            >
              <Ionicons name="lock-closed-outline" size={27} color={C.white} />
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  topHeader: {
    height: 325,
    backgroundColor: C.primary,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 30 : 16,
  },
  logoCircle: { width: 118, height: 118, alignItems: "center", justifyContent: "center", marginBottom: 18, position: "relative" },
  logoPerson: { position: "absolute", bottom: 29 },
  logoCrown: { position: "absolute", top: 28 },
  title: { color: C.white, fontSize: 37, fontWeight: "900", letterSpacing: 0.2 },
  subtitle: { marginTop: 12, color: "rgba(255,255,255,0.82)", fontSize: 19, fontWeight: "600", textAlign: "center" },
  form: { paddingHorizontal: 28, paddingTop: 42 },
  label: { color: C.text, fontSize: 22, fontWeight: "900", marginBottom: 12 },
  inputBox: { height: 74, borderWidth: 1.6, borderColor: C.border, borderRadius: 19, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, backgroundColor: C.white },
  inputIconBox: { width: 46, height: 46, borderRadius: 13, backgroundColor: "#F1F5FF", alignItems: "center", justifyContent: "center", marginRight: 16 },
  input: { flex: 1, fontSize: 18, fontWeight: "700", color: C.text, height: "100%" },
  row: { marginTop: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rememberRow: { flexDirection: "row", alignItems: "center" },
  checkBox: { width: 27, height: 27, borderRadius: 6, borderWidth: 1.8, borderColor: C.primary, alignItems: "center", justifyContent: "center", marginRight: 10 },
  checkedBox: { backgroundColor: C.primary },
  rememberText: { fontSize: 17, fontWeight: "700", color: C.text },
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: { fontSize: 13, color: C.primary, fontWeight: "700" },
  loginBtn: { backgroundColor: C.primary, borderRadius: 14, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28 },
  loginBtnText: { color: C.white, fontSize: 16, fontWeight: "800" },
  errorText: { marginTop: 14, fontSize: 14, fontWeight: "800", color: C.danger },
});
