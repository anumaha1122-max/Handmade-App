

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";  // Ensure COLORS are correctly imported
import { useShop } from "../../context/ShopContext";

export default function CustomerLoginScreen({ navigation, route }) {
  const role = route.params?.role || "customer";  // Default to 'customer' if no role is passed
  const { loginCustomer, loginSeller } = useShop();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Role configuration for different login flows
  const roleConfig = {
    customer: {
      title: "Customer Login",
      color: "#082843",  // Color for Customer
      next: "CustomerTabs",  // Navigate to CustomerTabs after login
    },
    seller: {
      title: "Seller Login",
      color: "#082843",  // Color for Seller
      next: "SellerTabs",  // Navigate to SellerTabs after login
    },
    admin: {
      title: "Admin Login",
      color: "#082843",  // Color for Admin
      next: "AdminTabs",  // Navigate to AdminTabs after login
    },
  };

  const current = roleConfig[role];  // Get the current role configuration

  // Login handler function
  const handleLogin = async () => {
    if (!emailOrPhone.trim() || !password) {
      Alert.alert("Error", "Please enter credentials.");
      return;
    }

    setLoading(true);
    try {
      if (role === "customer") {
        const res = await loginCustomer(emailOrPhone.trim(), password);
        if (res && !res.error) {
          navigation.replace(current.next);
        } else {
          Alert.alert("Login Failed", res?.message || "Invalid credentials.");
        }
      } else if (role === "seller") {
        const res = await loginSeller(emailOrPhone.trim(), password);
        if (res && !res.error) {
          navigation.replace(current.next);
        } else {
          Alert.alert("Login Failed", res?.message || "Invalid credentials.");
        }
      } else {
        // Admin fallback
        navigation.replace(current.next);
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}  // Go back to the previous screen
      >
        <Ionicons name="arrow-back" size={24} color={current.color} />
      </TouchableOpacity>

      <View style={styles.card}>
        {/* Title based on the current role */}
        <Text style={[styles.title, { color: current.color }]}>
          {current.title}
        </Text>

        {/* Email or Phone Input */}
        <TextInput
          style={styles.input}
          placeholder="Email or Phone"
          keyboardType="email-address"  // Set the keyboard type to email
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          autoCapitalize="none"
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry  // Mask the password input
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: current.color }]}  // Dynamic background color based on role
          onPress={handleLogin}  // Handle login and navigate
          disabled={loading}
        >
          <Text style={styles.loginText}>{loading ? "Signing in..." : "Login"}</Text>
        </TouchableOpacity>

        <Text style={styles.or}>or continue with</Text>

        {/* Social Media Login Buttons */}
        <View style={styles.socialRow}>
          <Ionicons name="logo-google" size={30} color="#EA4335" />
          <Ionicons name="logo-facebook" size={30} color="#1877F2" />
          <Ionicons name="logo-apple" size={30} color="#111" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",  // Background color based on global color settings
    justifyContent: "center",  // Center content vertically
    padding: 20,  // Padding around the screen
  },
  backBtn: {
    position: "absolute",
    top: 50,  // Position the back button at the top left
    left: 20,
    zIndex: 10,  // Make sure it's above other components
  },
  card: {
    backgroundColor: "#fff",  // White background for the login card
    padding: 24,
    borderRadius: 20,  // Rounded corners for the card
    elevation: 5,  // Shadow effect for the card
  },
  title: {
    fontSize: 26,  // Font size for the title
    fontWeight: "900",  // Bold font weight
    textAlign: "center",  // Center the title
    marginBottom: 20,  // Space below the title
  },
  input: {
    height: 48,  // Set height for input fields
    borderWidth: 1,
    borderColor: "#E5E7EB",  // Light grey border color
    borderRadius: 12,  // Rounded corners for the input fields
    paddingHorizontal: 12,  // Padding inside the input
    marginBottom: 12,  // Space between input fields
  },
  loginBtn: {
    height: 48,  // Height of the login button
    borderRadius: 12,  // Rounded corners for the button
    alignItems: "center",  // Center the text inside the button
    justifyContent: "center",  // Center the text inside the button vertically
    marginTop: 10,  // Space above the button
  },
  loginText: {
    color: "#fff",  // White text color for the login button
    fontWeight: "900",  // Bold text
    fontSize: 16,  // Font size of the button text
  },
  or: {
    textAlign: "center",  // Center the 'or continue with' text
    marginVertical: 14,  // Space above and below the 'or' text
    color: "#6B7280",  // Dark grey color for the text
  },
  socialRow: {
    flexDirection: "row",  // Arrange social media icons in a row
    justifyContent: "center",  // Center them horizontally
    gap: 25,  // Space between icons
  },
});