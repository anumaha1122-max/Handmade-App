import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { COLORS } from "../../constants/colors";
import { useShop } from "../../context/ShopContext";

const DELIVERY_CHARGE = 40;

const cleanPrice = (price) => {
  if (typeof price === "number") return price;
  const value = String(price ?? "0").replace(/[₹,\s]/g, "");
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

export default function CheckoutScreen({ navigation, route }) {
  const {
    cartItems,
    createOrder,
    clearCart,
    addresses = [],
    selectedAddressId,
    selectAddress,
    isPlacingOrder,
    setIsPlacingOrder,
  } = useShop();

  const product = route?.params?.product;
  const cartItemsFromParams = route?.params?.cartItems;
  const action = route?.params?.action;

  const items = useMemo(() => {
    if (Array.isArray(cartItemsFromParams) && cartItemsFromParams.length > 0) {
      return cartItemsFromParams;
    }
    if (product) return [product];
    return cartItems || [];
  }, [cartItemsFromParams, product, cartItems]);

  const activeAddress = useMemo(() => {
    if (selectedAddressId) {
      return addresses.find((a) => String(a.id) === String(selectedAddressId)) || null;
    }
    return addresses.find((a) => a.isDefault) || addresses[0] || null;
  }, [addresses, selectedAddressId]);

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [message, setMessage] = useState("");

  const itemTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = item?.qty || item?.quantity || 1;
      return sum + cleanPrice(item?.price) * qty;
    }, 0);
  }, [items]);

  const totalAmount = itemTotal + DELIVERY_CHARGE;

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2400);
  };

  const handlePlaceOrder = async () => {
    if (!items.length) {
      showMessage("No products found for checkout.");
      return;
    }
    if (!activeAddress) {
      showMessage("Please add a delivery address first.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const newOrder = await createOrder({
        items,
        paymentMethod,
        deliveryCharge: DELIVERY_CHARGE,
        clearOrderedCart: action !== "buyNow",
        address: activeAddress,
      });
      if (!newOrder) {
        showMessage("Order failed. Please try again.");
        return;
      }
      if (newOrder.razorpayOrderId) {
        navigation.navigate("RazorpayPayment", {
          razorpayOrderId: newOrder.razorpayOrderId,
          razorpayKeyId: newOrder.razorpayKeyId,
          amount: newOrder.amount,
          orderId: newOrder.orderId,
          customerName: activeAddress?.fullName || "Customer",
          customerPhone: activeAddress?.phone || "",
          orderData: { clearOrderedCart: action !== "buyNow" }
        });
      } else {
        if (action === "buyNow") {
          clearCart();
        }
        navigation.navigate("MyOrders", { latestOrder: newOrder, hasPurchased: true });
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const renderAddressItem = (address) => (
    <TouchableOpacity
      key={address.id}
      style={[
        styles.addressItem,
        activeAddress && String(activeAddress.id) === String(address.id) && styles.activeAddressItem,
      ]}
      onPress={() => selectAddress(address.id)}
    >
      <View style={styles.addressInfo}>
        <Text style={styles.name}>{address.fullName || "Unnamed"}</Text>
        <Text style={styles.text}>{`${address.line1}${address.line2 ? ", " + address.line2 : ""}`}</Text>
        <Text style={styles.text}>{`${address.city}, ${address.state} - ${address.pincode}`}</Text>
      </View>
      <Ionicons
        name={activeAddress && String(activeAddress.id) === String(address.id) ? "radio-button-on" : "radio-button-off"}
        size={23}
        color={activeAddress && String(activeAddress.id) === String(address.id) ? COLORS.customer || "#E83E7C" : "#9CA3AF"}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Checkout" navigation={navigation} color={COLORS.customer} />
      {message ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={24} color={COLORS.customer || "#E83E7C"} />
            <Text style={styles.title}>Delivery Address</Text>
          </View>
          <Text style={styles.name}>{activeAddress ? activeAddress.fullName : "No Saved Address"}</Text>
          <Text style={styles.text}>
            {activeAddress ? `${activeAddress.line1}${activeAddress.line2 ? ", " + activeAddress.line2 : ""}` : "Please add a saved address in your profile"}
          </Text>
          <Text style={styles.text}>{activeAddress ? `${activeAddress.city}, ${activeAddress.state} - ${activeAddress.pincode}` : ""}</Text>
        </View>

        {/* Address Selector */}
        <View style={styles.addressList}>{addresses.map(renderAddressItem)}</View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bag-handle-outline" size={24} color={COLORS.customer || "#E83E7C"} />
            <Text style={styles.title}>Order Items</Text>
          </View>
          {items.map((item, index) => (
            <View key={`${item?.id || item?.name || index}`} style={styles.itemRow}>
              <View style={styles.itemIcon}>
                <Ionicons name="cube-outline" size={22} color={COLORS.customer || "#E83E7C"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item?.name || "Product"}
                </Text>
                <Text style={styles.itemQty}>Qty: {item?.qty || item?.quantity || 1}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {String(item?.price || "").includes("₹") ? item?.price : `₹${item?.price || 0}`}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.customer || "#E83E7C"} />
            <Text style={styles.title}>Payment Method</Text>
          </View>
          <PaymentOption title="UPI" subtitle="Pay using PhonePe, Google Pay, Paytm" icon="phone-portrait-outline" active={paymentMethod === "UPI"} onPress={() => setPaymentMethod("UPI")} />
          <PaymentOption title="Credit / Debit Card" subtitle="Pay securely using your bank card" icon="card-outline" active={paymentMethod === "CARD"} onPress={() => setPaymentMethod("CARD")} />
          <PaymentOption title="Cash on Delivery" subtitle="Pay when your order reaches your address" icon="cash-outline" active={paymentMethod === "COD"} onPress={() => setPaymentMethod("COD")} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={24} color={COLORS.customer || "#E83E7C"} />
            <Text style={styles.title}>Price Details</Text>
          </View>
          <PriceRow label="Item Total" value={`₹${itemTotal}`} />
          <PriceRow label="Delivery Charges" value={`₹${DELIVERY_CHARGE}`} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.total}>₹{totalAmount}</Text>
          </View>
          <View style={styles.buttonGap}>
            <Button
              title={paymentMethod === "COD" ? "Order with Cash on Delivery" : `Pay ₹${totalAmount}`}
              color={paymentMethod === "COD" ? "#16A34A" : COLORS.customer}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
            />
            {isPlacingOrder && <ActivityIndicator style={styles.loadingOverlay} size="large" color={COLORS.customer} />}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

function PaymentOption({ title, subtitle, icon, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.paymentOption, active && styles.activePaymentOption]} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.paymentIcon, active && styles.activePaymentIcon]}>
        <Ionicons name={icon} size={22} color={active ? "#FFFFFF" : COLORS.customer || "#E83E7C"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.paymentTitle}>{title}</Text>
        <Text style={styles.paymentSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name={active ? "radio-button-on" : "radio-button-off"} size={23} color={active ? COLORS.customer || "#E83E7C" : "#9CA3AF"} />
    </TouchableOpacity>
  );
}

function PriceRow({ label, value }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingBottom: 20 },
  messageBox: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#111827",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: "900", color: COLORS.text || "#111827" },
  name: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text || "#111827",
    marginBottom: 6,
  },
  text: {
    color: COLORS.muted || "#6B7280",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
  },
  addressList: { marginVertical: 4, marginHorizontal: 16 },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    elevation: 2,
  },
  activeAddressItem: { borderColor: COLORS.customer || "#E83E7C", backgroundColor: "#FFF4F8" },
  addressInfo: { flex: 1 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFF4F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemName: { fontSize: 14, fontWeight: "900", color: COLORS.text || "#111827" },
  itemQty: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted || "#6B7280",
  },
  itemPrice: { fontSize: 14, fontWeight: "900", color: COLORS.customer || "#E83E7C" },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  activePaymentOption: {
    borderColor: COLORS.customer || "#E83E7C",
    backgroundColor: "#FFF4F8",
  },
  paymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFF4F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activePaymentIcon: { backgroundColor: COLORS.customer || "#E83E7C" },
  paymentTitle: { fontSize: 14, fontWeight: "900", color: COLORS.text || "#111827" },
  paymentSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted || "#6B7280",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceLabel: { fontSize: 14, fontWeight: "700", color: COLORS.muted || "#6B7280" },
  priceValue: { fontSize: 14, fontWeight: "900", color: COLORS.text || "#111827" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 17, fontWeight: "900", color: COLORS.text || "#111827" },
  total: { fontSize: 20, fontWeight: "900", color: COLORS.customer || "#E83E7C" },
  buttonGap: { marginTop: 18 },
  loadingOverlay: { position: "absolute", top: "50%", left: "50%", marginLeft: -20, marginTop: -20 },
});