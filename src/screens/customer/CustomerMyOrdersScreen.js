
// screens/customer/CustomerMyOrdersScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#033B3D",
  bg: "#F7F7F7",
  white: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#ECECEC",

  processingBg: "#FEF3C7",
  processingText: "#D97706",

  shippedBg: "#DBEAFE",
  shippedText: "#2563EB",

  deliveredBg: "#DCFCE7",
  deliveredText: "#16A34A",

  cancelledBg: "#FEE2E2",
  cancelledText: "#DC2626",
};

import { useShop } from "../../context/ShopContext";

const filters = ["All Orders", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function CustomerMyOrdersScreen({ navigation, route }) {
  const { orders: contextOrders = [], cartCount = 0 } = useShop() || {};
  const orders = route?.params?.orders || contextOrders;

  const [activeFilter, setActiveFilter] = useState("All Orders");

  const filteredOrders = useMemo(() => {
    if (activeFilter === "All Orders") return orders;
    return orders.filter((item) => item.status === activeFilter);
  }, [activeFilter, orders]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Processing":
        return { bg: COLORS.processingBg, text: COLORS.processingText, icon: "time-outline" };
      case "Shipped":
        return { bg: COLORS.shippedBg, text: COLORS.shippedText, icon: "car-outline" };
      case "Delivered":
        return { bg: COLORS.deliveredBg, text: COLORS.deliveredText, icon: "checkmark-circle-outline" };
      case "Cancelled":
        return { bg: COLORS.cancelledBg, text: COLORS.cancelledText, icon: "close-circle-outline" };
      default:
        return { bg: "#F3F4F6", text: "#374151", icon: "ellipse-outline" };
    }
  };

  const buildOrderForDetails = (item) => ({
    ...item,
    products: item.products || [],
    items: item.products || [],
    totalAmount: item.totalAmount,
    payment: item.payment || "Cash on Delivery",
    address: item.address || {
      name: "Customer",
      line1: "Delivery address",
      city: "City",
      state: "State",
      pincode: "000000",
    },
  });

  const goToOrderDetails = (item) => {
    navigation.navigate("OrderDetail", {
      order: buildOrderForDetails(item),
    });
  };

  const handleSupportPress = (item) => {
    if (item.status === "Delivered") {
      navigation.navigate("ProductList");
    } else {
      navigation.navigate("CustomerChatSupport");
    }
  };

  const handleCartPress = () => {
    navigation.navigate("CartScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Orders</Text>

        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.85} onPress={handleCartPress}>
          <Ionicons name="cart-outline" size={26} color="#111" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((item) => (
          <TouchableOpacity
            key={item}
            activeOpacity={0.85}
            style={styles.filterBtn}
            onPress={() => setActiveFilter(item)}
          >
            <Text style={[styles.filterText, activeFilter === item && styles.activeFilterText]}>
              {item}
            </Text>

            {activeFilter === item && <View style={styles.activeLine} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredOrders.map((item) => {
          const statusStyle = getStatusStyle(item.status);
          
          const title = item.products && item.products.length > 0 ? item.products[0].name : item.title || "Order";
          const qty = item.products && item.products.length > 0 ? item.products[0].qty : item.qty || 1;
          const imgPath = item.products && item.products.length > 0 ? item.products[0].image : null;
          const itemImage = imgPath ? { uri: imgPath } : item.image || require("../../../assets/images/kurti.png");
          
          const d = new Date(item.createdAt || item.date || Date.now());
          const orderDate = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
          const orderTime = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.orderCard}
              onPress={() => goToOrderDetails(item)}
            >
              <View style={styles.orderTop}>
                <Image source={itemImage} style={styles.productImage} />

                <View style={styles.orderInfo}>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderId}>Order ID: {item.id}</Text>

                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Ionicons name={statusStyle.icon} size={14} color={statusStyle.text} />
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.orderDate}>
                    {orderDate} • {orderTime}
                  </Text>

                  <Text style={styles.productTitle} numberOfLines={2}>
                    {title}
                  </Text>

                  <Text style={styles.productMeta}>
                    {item.products?.length > 1 ? `+${item.products.length - 1} more items • ` : ""}Qty: {qty}
                  </Text>

                  <Text style={styles.price}>{item.price}</Text>

                  {item.status === "Delivered" && (
                    <View style={styles.deliveredRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                      <Text style={styles.deliveredText}>
                        Delivered on {orderDate}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity activeOpacity={0.8} onPress={() => goToOrderDetails(item)}>
                  <Ionicons name="chevron-forward" size={28} color="#111" />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.supportBtn}
                  activeOpacity={0.85}
                  onPress={() => handleSupportPress(item)}
                >
                  <Ionicons
                    name={
                      item.status === "Delivered"
                        ? "repeat-outline"
                        : "chatbubble-ellipses-outline"
                    }
                    size={18}
                    color="#111"
                  />

                  <Text style={styles.supportText}>
                    {item.status === "Delivered" ? "Buy Again" : "Order Support"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailsBtn}
                  activeOpacity={0.85}
                  onPress={() => goToOrderDetails(item)}
                >
                  <Text style={styles.detailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredOrders.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptyText}>Orders matching this filter will appear here.</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    height: 72,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },

  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    paddingHorizontal: 14,
  },

  filterBtn: {
    marginRight: 24,
    paddingVertical: 10,
  },

  filterText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },

  activeFilterText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  activeLine: {
    marginTop: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },

  scrollContent: {
    padding: 14,
    paddingBottom: 30,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 10,
    elevation: 3,
  },

  orderTop: {
    flexDirection: "row",
  },

  productImage: {
    width: 95,
    height: 95,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
  },

  orderInfo: {
    flex: 1,
    marginLeft: 14,
  },

  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
    marginRight: 8,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },

  statusText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "900",
  },

  orderDate: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },

  productTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  productMeta: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },

  price: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  deliveredRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  deliveredText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#16A34A",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  supportBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  supportText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  detailsBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  detailsText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  emptyBox: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.muted,
    lineHeight: 20,
  },
});