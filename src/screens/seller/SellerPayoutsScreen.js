import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const C = {
  primary: "#0e3243",
  primaryDark: "#0e3243",
  white: "#FFFFFF",
  bg: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#F3D3E2",
  soft: "#FFFFFF",
  green: "#16A34A",
  orange: "#F59E0B",
};

const payoutHistory = [
  {
    id: "#PAYOUT0012",
    amount: "₹8,560.00",
    date: "Paid on 5 Apr 2024",
    status: "Success",
  },
  {
    id: "#PAYOUT0011",
    amount: "₹7,230.00",
    date: "Paid on 22 Mar 2024",
    status: "Success",
  },
  {
    id: "#PAYOUT0010",
    amount: "₹6,800.00",
    date: "Paid on 8 Mar 2024",
    status: "Success",
  },
];

export default function SellerPayoutScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [requested, setRequested] = useState(false);

  const availableBalance = 12450;

  const canWithdraw = useMemo(() => {
    const n = Number(amount);
    return n > 0 && n <= availableBalance;
  }, [amount]);

  const withdraw = () => {
    if (!canWithdraw) return;
    setRequested(true);
    setAmount("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={C.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Payouts</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[C.primaryDark, C.primary]}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>₹12,450.00</Text>
            <Text style={styles.balanceSub}>Ready to withdraw</Text>
          </View>

          <View style={styles.walletBox}>
            <Ionicons name="wallet" size={34} color={C.primary} />
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Withdraw Amount</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            placeholderTextColor="#A1A1AA"
            keyboardType="number-pad"
            style={styles.input}
          />

          {requested && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={C.green} />
              <Text style={styles.successText}>Payout request submitted.</Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!canWithdraw}
            onPress={withdraw}
            style={[styles.withdrawBtn, !canWithdraw && { opacity: 0.45 }]}
          >
            <Text style={styles.withdrawText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bank Details</Text>

          <Info label="Account Holder" value="Priya Sharma" />
          <Info label="Bank Name" value="HDFC Bank" />
          <Info label="Account Number" value="XXXX XXXX 4821" />
          <Info label="IFSC Code" value="HDFC0001234" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payout History</Text>

          {payoutHistory.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <Ionicons name="cash-outline" size={22} color={C.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.payoutId}>{item.id}</Text>
                <Text style={styles.payoutDate}>{item.date}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.amount}>{item.amount}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 22,
    minHeight: 150,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  balanceLabel: {
    color: "#FCE7F3",
    fontSize: 13,
    fontWeight: "800",
  },
  balanceValue: {
    color: C.white,
    fontSize: 31,
    fontWeight: "900",
    marginTop: 8,
  },
  balanceSub: {
    color: "#FCE7F3",
    marginTop: 6,
    fontWeight: "700",
  },
  walletBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: C.text,
    marginBottom: 14,
  },
  input: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1.4,
    borderColor: C.border,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
  },
  withdrawBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  withdrawText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "900",
  },
  successBox: {
    marginTop: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  successText: {
    marginLeft: 8,
    color: C.green,
    fontWeight: "800",
  },
  infoRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F8EAF1",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    color: C.text,
    fontSize: 13,
    fontWeight: "900",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F8EAF1",
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  payoutId: {
    color: C.text,
    fontSize: 13,
    fontWeight: "900",
  },
  payoutDate: {
    color: C.muted,
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
  amount: {
    color: C.text,
    fontSize: 13,
    fontWeight: "900",
  },
  statusPill: {
    marginTop: 6,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    color: C.green,
    fontSize: 10,
    fontWeight: "900",
  },
});