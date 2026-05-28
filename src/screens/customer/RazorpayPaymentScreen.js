// src/screens/customer/RazorpayPaymentScreen.js
// Handles the full Razorpay WebView checkout flow.
// After the user pays (or closes), we verify the signature with our backend.

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useShop } from "../../context/ShopContext";

/**
 * Route params expected:
 *  - razorpayOrderId  : string  (e.g. "order_xxxx")
 *  - razorpayKeyId    : string  (Razorpay key_id)
 *  - amount           : number  (amount in paise)
 *  - orderId          : number  (our DB order id)
 *  - customerName     : string
 *  - customerEmail    : string
 *  - customerPhone    : string
 *  - description      : string
 */
export default function RazorpayPaymentScreen({ navigation, route }) {
  const {
    razorpayOrderId,
    razorpayKeyId,
    amount,
    orderId,
    customerName = "Customer",
    customerEmail = "",
    customerPhone = "",
    description = "Order Payment",
    orderData,
  } = route.params || {};

  const { verifyRazorpayPayment } = useShop();
  const webViewRef = useRef(null);
  const isMockKey = String(razorpayKeyId || "").toLowerCase().includes("mock");
  const [loading, setLoading] = useState(!isMockKey);
  const [verifying, setVerifying] = useState(false);

  // HTML page that loads Razorpay checkout.js in a WebView
  const razorpayHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Martzy Secure Payment Simulator</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #FAF9F6; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .card {
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
      width: 100%;
      max-width: 360px;
      padding: 32px 24px;
      text-align: center;
      border: 1px solid rgba(0, 0, 0, 0.03);
    }
    .logo-container {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: #FFF0F5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .logo-container span {
      font-size: 32px;
    }
    h2 { font-size: 20px; font-weight: 800; color: #1F2937; margin-bottom: 8px; }
    .subtitle { font-size: 13px; color: #6B7280; margin-bottom: 24px; line-height: 1.5; font-weight: 500; }
    .badge {
      display: inline-block;
      background: #ECFDF5;
      color: #10B981;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 12px;
      margin-bottom: 24px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .details-box {
      background: #F9FAFB;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 28px;
      text-align: left;
      border: 1px solid #F3F4F6;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label { font-size: 13px; color: #6B7280; font-weight: 600; }
    .detail-val { font-size: 13px; color: #1F2937; font-weight: 700; }
    .amount-val { font-size: 16px; color: #E83E7C; font-weight: 800; }
    button {
      width: 100%;
      padding: 15px 20px;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    .btn-success {
      background: #E83E7C;
      color: #FFFFFF;
      margin-bottom: 12px;
    }
    .btn-success:active {
      transform: scale(0.98);
      background: #D0326D;
    }
    .btn-cancel {
      background: #F3F4F6;
      color: #4B5563;
    }
    .btn-cancel:active {
      transform: scale(0.98);
      background: #E5E7EB;
    }
    #status { margin-top: 16px; font-size: 13px; color: #E83E7C; font-weight: 700; display: none; }
  </style>
</head>
<body>

  <div class="card">
    <div class="logo-container">
      <span>🛍️</span>
    </div>
    <h2>Martzy Simulator</h2>
    <p class="subtitle">A secure environment to verify UPI & Credit/Debit card checkout locally.</p>
    <div class="badge">Demo Sandbox Mode</div>

    <div class="details-box">
      <div class="detail-row">
        <span class="detail-label">Order Ref:</span>
        <span class="detail-val" id="order-id-label">${razorpayOrderId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Customer Name:</span>
        <span class="detail-val">${customerName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount Payable:</span>
        <span class="amount-val">₹${Math.round(amount / 100)}</span>
      </div>
    </div>

    <button class="btn-success" id="success-btn" onclick="simulateSuccess()">Simulate Success</button>
    <button class="btn-cancel" id="cancel-btn" onclick="simulateDismiss()">Cancel Payment</button>
    <p id="status">Sending success response...</p>
  </div>

  ${isMockKey ? "" : '<script src="https://checkout.razorpay.com/v1/checkout.js"></script>'}
  <script>
    const isMock = '${razorpayKeyId}'.includes('mock');

    function simulateSuccess() {
      document.getElementById('status').style.display = 'block';
      document.getElementById('success-btn').disabled = true;
      document.getElementById('cancel-btn').disabled = true;
      setTimeout(function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PAYMENT_SUCCESS',
          razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
          razorpay_order_id: '${razorpayOrderId}',
          razorpay_signature: 'sig_mock_' + Math.random().toString(36).substr(2, 9),
        }));
      }, 800);
    }

    function simulateDismiss() {
      document.getElementById('cancel-btn').disabled = true;
      document.getElementById('success-btn').disabled = true;
      setTimeout(function() {
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_DISMISSED' }));
        }
      }, 200);
    }

    function openRazorpay() {
      if (isMock) {
        // Mock mode: WebView renders this custom UI, no real Razorpay checkout needed
        return;
      }

      document.getElementById('status').innerText = 'Opening live payment gateway...';
      document.getElementById('status').style.display = 'block';
      var options = {
        key: '${razorpayKeyId}',
        amount: '${amount}',
        currency: 'INR',
        name: 'Martzy',
        description: '${description.replace(/'/g, "\\'")}',
        order_id: '${razorpayOrderId}',
        prefill: {
          name: '${customerName.replace(/'/g, "\\'")}',
          email: '${customerEmail}',
          contact: '${customerPhone}',
        },
        theme: { color: '#E83E7C' },
        handler: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_SUCCESS',
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }));
        },
        modal: {
          ondismiss: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_DISMISSED' }));
          }
        }
      };
      try {
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_FAILED',
            error: response.error.description
          }));
        });
        rzp.open();
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_ERROR', error: e.message }));
      }
    }

    // Auto-open on load ONLY if not in mock mode
    window.onload = function() { 
      if (!isMock) {
        setTimeout(openRazorpay, 800); 
      }
    };
  </script>
</body>
</html>
  `;

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "PAYMENT_SUCCESS") {
        setVerifying(true);
        const result = await verifyRazorpayPayment({
          orderId,
          razorpayOrderId: data.razorpay_order_id,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpaySignature: data.razorpay_signature,
          orderData,
        });
        setVerifying(false);
        if (result) {
          navigation.replace("MyOrders", {
            latestOrder: result,
            hasPurchased: true,
          });
        } else {
          Alert.alert(
            "Verification Failed",
            "Payment was made but verification failed. Contact support with your payment ID: " +
              data.razorpay_payment_id,
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
      } else if (data.type === "PAYMENT_DISMISSED") {
        Alert.alert("Payment Cancelled", "You cancelled the payment.", [
          { text: "Try Again", onPress: () => webViewRef.current?.reload() },
          {
            text: "Go Back",
            style: "cancel",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else if (
        data.type === "PAYMENT_FAILED" ||
        data.type === "PAYMENT_ERROR"
      ) {
        Alert.alert(
          "Payment Failed",
          data.error || "Something went wrong. Please try again.",
          [
            { text: "Retry", onPress: () => webViewRef.current?.reload() },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (e) {
      console.error("WebView message parse error:", e);
    }
  };

  if (verifying) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#E83E7C" />
        <Text style={styles.verifyingText}>Verifying payment…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            Alert.alert(
              "Cancel Payment",
              "Are you sure you want to cancel this payment?",
              [
                { text: "No", style: "cancel" },
                {
                  text: "Yes, Cancel",
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          }}
        >
          <Ionicons name="close" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.lockRow}>
          <Ionicons name="lock-closed" size={14} color="#16A34A" />
          <Text style={styles.secureText}>Razorpay</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E83E7C" />
          <Text style={styles.loadingText}>Loading payment gateway…</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: razorpayHTML }}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            style={styles.webviewLoader}
            size="large"
            color="#E83E7C"
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  verifyingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  header: {
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  secureText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },
  loadingOverlay: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  webview: { flex: 1 },
  webviewLoader: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});
