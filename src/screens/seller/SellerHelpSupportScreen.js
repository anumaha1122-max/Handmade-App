// src/screens/seller/SellerHelpSupportScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const C = {
  primary: "#082843",
  white: "#FFFFFF",
  bg: "#F8FAFC",
  text: "#111827",
  muted: "#6B7280",
  border: "#E2E8F0",
  success: "#16A34A",
  card: "#FFFFFF",
};

const FAQS = [
  {
    q: "How do I add a new product?",
    a: "Go to Dashboard → Add Product. Fill in the product details, images, price and stock. After reviewing, pay the 10% platform fee to submit for admin approval.",
  },
  {
    q: "When will my product go live?",
    a: "After you submit your product with payment, our admin team reviews it within 24 hours. Once approved, it becomes visible to all customers automatically.",
  },
  {
    q: "How are payments processed?",
    a: "Customers pay on the platform. After a 7-day settlement window, your earnings (90% of sale price) are credited to your registered bank account.",
  },
  {
    q: "How do I handle returns?",
    a: "Customer return requests appear in the Orders → Returns tab. Accept the return, and once you receive the product, mark it received. The refund will be auto-credited to the customer.",
  },
  {
    q: "What is the 10% admin commission?",
    a: "The 10% fee covers platform maintenance, marketing, payment gateway charges, and seller & buyer support services.",
  },
  {
    q: "How do I contact admin?",
    a: "Use the chat option below or email us at support@craftymarketplace.in. Our team responds within 24 hours on business days.",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Chat with Support",
    icon: "chatbubbles-outline",
    color: C.primary,
    bg: "#EFF6FF",
    onPress: () => Alert.alert("Chat", "Opening live chat..."),
  },
  {
    label: "Email Us",
    icon: "mail-outline",
    color: "#7C3AED",
    bg: "#F5F3FF",
    onPress: () => Linking.openURL("mailto:support@craftymarketplace.in"),
  },
  {
    label: "Call Support",
    icon: "call-outline",
    color: "#16A34A",
    bg: "#ECFDF5",
    onPress: () => Linking.openURL("tel:+911800123456"),
  },
  {
    label: "Report a Bug",
    icon: "bug-outline",
    color: "#EF4444",
    bg: "#FFF5F5",
    onPress: () => Alert.alert("Report", "Bug report form coming soon."),
  },
];

export default function SellerHelpSupportScreen({ navigation }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy-outline" size={36} color={C.white} />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSub}>
            We're here 24/7. Find answers below or reach out to us.
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>Quick Contact</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickCard}
              onPress={action.onPress}
              activeOpacity={0.85}
            >
              <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        <View style={styles.faqCard}>
          {FAQS.map((faq, idx) => (
            <View key={idx}>
              <TouchableOpacity
                style={styles.faqRow}
                onPress={() => toggleFaq(idx)}
                activeOpacity={0.85}
              >
                <Text style={styles.faqQ} numberOfLines={openFaq === idx ? undefined : 2}>
                  {faq.q}
                </Text>
                <Ionicons
                  name={openFaq === idx ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={C.muted}
                />
              </TouchableOpacity>
              {openFaq === idx && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqA}>{faq.a}</Text>
                </View>
              )}
              {idx < FAQS.length - 1 && <View style={styles.faqDivider} />}
            </View>
          ))}
        </View>

        {/* Business Hours */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <Ionicons name="time-outline" size={20} color={C.primary} />
            <Text style={styles.hoursTitle}>Support Hours</Text>
          </View>
          {[
            { day: "Monday – Friday", time: "9:00 AM – 8:00 PM" },
            { day: "Saturday", time: "10:00 AM – 6:00 PM" },
            { day: "Sunday", time: "Closed" },
          ].map((h) => (
            <View key={h.day} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{h.day}</Text>
              <Text
                style={[
                  styles.hoursTime,
                  h.time === "Closed" && { color: "#EF4444" },
                ]}
              >
                {h.time}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: Platform.OS === "android" ? 38 : 54,
    paddingHorizontal: 16, paddingBottom: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: C.text },
  content: { padding: 16, paddingBottom: 40 },

  heroBanner: {
    backgroundColor: C.primary, borderRadius: 22, padding: 24,
    alignItems: "center", marginBottom: 22,
  },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  heroTitle: { fontSize: 22, fontWeight: "900", color: C.white, marginBottom: 8 },
  heroSub: {
    fontSize: 13, fontWeight: "600",
    color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 20,
  },

  sectionLabel: {
    fontSize: 12, fontWeight: "900", color: C.muted,
    textTransform: "uppercase", letterSpacing: 0.8,
    marginBottom: 10, marginLeft: 4,
  },

  quickGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22,
  },
  quickCard: {
    flex: 1, minWidth: "44%", backgroundColor: C.card,
    borderRadius: 16, padding: 16, alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: C.border,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  quickIcon: {
    width: 50, height: 50, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  quickLabel: { fontSize: 12, fontWeight: "800", color: C.text, textAlign: "center" },

  faqCard: {
    backgroundColor: C.card, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    padding: 16, marginBottom: 16,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  faqRow: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between", gap: 12, paddingVertical: 14,
  },
  faqQ: { flex: 1, fontSize: 14, fontWeight: "800", color: C.text, lineHeight: 20 },
  faqAnswer: {
    paddingBottom: 14, paddingRight: 28,
  },
  faqA: { fontSize: 13, fontWeight: "600", color: C.muted, lineHeight: 20 },
  faqDivider: { height: 1, backgroundColor: C.border },

  hoursCard: {
    backgroundColor: C.card, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, padding: 16,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  hoursHeader: {
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14,
  },
  hoursTitle: { fontSize: 16, fontWeight: "900", color: C.text },
  hoursRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  hoursDay: { fontSize: 13, fontWeight: "700", color: C.text },
  hoursTime: { fontSize: 13, fontWeight: "800", color: C.success },
});