


// src/context/ShopContext.js

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { API_BASE_URL } from "../config/api";

const ShopContext = createContext(null);

// ─── Pure helpers ─────────────────────────────────────────────────────────────
const cleanPrice = (price) => {
  if (typeof price === "number") return price;
  const value = String(price ?? "0").replace(/[₹$,\s]/g, "");
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

const formatPrice = (amount) =>
  `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;

const getDiscountedPrice = (price, discount = 0) => {
  const amount = cleanPrice(price);
  const off = Number(discount ?? 0);
  return Math.max(amount - (amount * off) / 100, 0);
};

const mapOrderStatus = (status) => {
  if (!status) return "Processing";
  const s = String(status).toUpperCase();
  if (s === "PLACED") return "Processing";
  if (s === "COMPLETED" || s === "DELIVERED") return "Delivered";
  if (s === "SHIPPED") return "Shipped";
  if (s === "CANCELLED") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const mapApiReturn = (raw, allOrders = []) => {
  if (!raw) return null;
  const orderIdStr = `#ORD${raw.orderId}`;
  const matchingOrder = allOrders.find(o => String(o.id) === orderIdStr || String(o.orderId) === String(raw.orderId));

  let statusText = "Return Requested";
  if (raw.status === "PICKED_UP") statusText = "Return Pickup Started";
  if (raw.status === "REFUNDED") statusText = "Product Received";
  if (raw.status === "APPROVED") statusText = "Return Approved";
  if (raw.status === "REJECTED") statusText = "Return Rejected";

  const customerName = matchingOrder?.address?.fullName || matchingOrder?.customer || `Customer #${raw.customerId}`;
  const productName = matchingOrder?.products?.[0]?.name || "Product";
  const image = matchingOrder?.products?.[0]?.image || null;
  const refundAmt = raw.refundAmount || matchingOrder?.totalAmount || 0;

  return {
    id: `#RET${raw.id}`,
    returnId: raw.id,
    orderId: orderIdStr,
    rawOrderId: raw.orderId,
    customerId: raw.customerId,
    sellerId: raw.sellerId,
    customer: customerName,
    product: productName,
    image: image,
    reason: raw.reason,
    description: raw.description,
    status: statusText,
    rawStatus: raw.status,
    requestedOn: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Today",
    refundAmount: refundAmt,
    refundAmountText: `₹${Number(refundAmt).toLocaleString("en-IN")}`,
    refundCredited: raw.status === "REFUNDED",
    creditedOn: raw.status === "REFUNDED" ? "Today" : null,
  };
};

const mapApiComplaint = (raw, allOrders = []) => {
  if (!raw) return null;
  const orderIdStr = `#ORD${raw.orderId}`;
  const matchingOrder = allOrders.find(o => String(o.id) === orderIdStr || String(o.orderId) === String(raw.orderId));

  let statusText = "Pending";
  if (raw.status === "IN_PROGRESS") statusText = "Under Review";
  if (raw.status === "RESOLVED") statusText = "Resolved";
  if (raw.status === "CLOSED") statusText = "Closed";

  const customerName = matchingOrder?.address?.fullName || matchingOrder?.customer || `Customer #${raw.customerId}`;
  const productName = matchingOrder?.products?.[0]?.name || "Product";

  const isHighPriority = /damage|broken|wrong|fake|defect/i.test((raw.subject || "") + " " + (raw.description || ""));

  return {
    id: `CMP${String(raw.id).padStart(3, '0')}`,
    complaintId: raw.id,
    title: raw.subject,
    description: raw.description,
    orderId: orderIdStr,
    rawOrderId: raw.orderId,
    customerId: raw.customerId,
    sellerId: raw.sellerId,
    customer: customerName,
    product: productName,
    status: statusText,
    rawStatus: raw.status,
    priority: isHighPriority ? "High" : "Medium",
    time: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Just now",
    sellerResponse: raw.sellerResponse,
    adminNote: raw.adminNote,
  };
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function nowLabel() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const normalizeProduct = (product = {}) => {
  const priceNumber = cleanPrice(product.price ?? product.originalPrice ?? 0);
  const discount = Number(product.discount ?? 0);
  const finalPriceNumber = getDiscountedPrice(priceNumber, discount);

  const rawImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  return {
    id: product.id ?? `P${Date.now().toString().slice(-6)}`,
    name: product.name ?? "New Product",
    price: formatPrice(priceNumber),
    originalPrice: formatPrice(priceNumber),
    discount,
    finalPrice: formatPrice(finalPriceNumber),
    image: rawImages[0] ?? null,
    images: rawImages,
    stock: Number(product.stock ?? 1),
    category: product.category ?? "Decor",
    subcategory: product.subcategory ?? "",
    sellerId: product.sellerId ?? "SELLER001",
    sellerName: product.sellerName ?? "Seller Hub",
    visibleToCustomer:
      typeof product.visibleToCustomer === "boolean"
        ? product.visibleToCustomer
        : true,
    active: typeof product.active === "boolean" ? product.active : true,
    status: product.status ?? "Live",
    description: product.description ?? "",
    weight: product.weight ?? "",
    size: product.size ?? "Medium",
    material: product.material ?? "Handmade / Premium Quality",
    color: product.color ?? "As shown in image",
    delivery: product.delivery ?? "Delivery in 3 - 5 days",
    returnPolicy: product.returnPolicy ?? "7 days replacement available",
    rating: product.rating ?? 4.5,
    reviews: product.reviews ?? 0,
    customerReviews: product.customerReviews ?? [],
    sku: product.sku ?? "",
    paymentStatus: product.paymentStatus ?? null,
    uploadFee: product.uploadFee ?? null,
    paymentMethod: product.paymentMethod ?? null,
    paidAt: product.paidAt ?? null,
    createdAt: product.createdAt ?? new Date().toISOString(),
    updatedAt: product.updatedAt ?? new Date().toISOString(),
  };
};

// ─── Initial seed data ────────────────────────────────────────────────────────
const initialProducts = [
  normalizeProduct({
    id: "P001",
    name: "Macrame Wall Hanging",
    price: "₹899",
    discount: 20,
    image: "https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?w=400",
    stock: 25,
    category: "Decor",
    subcategory: "Wall Decor",
    description: "Beautiful handmade macrame wall hanging.",
    sku: "MW-001",
    reviews: 120,
    sellerId: "SELLER001",
    sellerName: "Demo Shop",
    active: true,
  }),
  normalizeProduct({
    id: "P002",
    name: "Terracotta Planter",
    price: "₹499",
    discount: 10,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
    stock: 40,
    category: "Pottery",
    subcategory: "Planters",
    description: "Handmade terracotta planter for home and garden.",
    sku: "TP-002",
    reviews: 80,
    sellerId: "SELLER001",
    sellerName: "Demo Shop",
    active: true,
  }),
];

const initialDeliveryPartners = [
  {
    id: "D001",
    name: "Ravi Local Delivery",
    phone: "9876543210",
    vehicle: "Bike",
    area: "Hyderabad Local",
    price: 60,
    rating: 4.8,
    status: "Available",
  },
  {
    id: "D002",
    name: "QuickShip Partner",
    phone: "9123456780",
    vehicle: "Mini Van",
    area: "Intercity Delivery",
    price: 95,
    rating: 4.6,
    status: "Available",
  },
];

const initialOrders = [];

const initialSellerNotifications = [
  {
    id: "SN001",
    title: "New order received",
    message: "Order #ORD12345 has been placed.",
    time: "10:30 AM",
    read: false,
    type: "order",
  },
];

const initialAdminNotifications = [
  {
    id: "AN001",
    type: "order",
    icon: "receipt-outline",
    iconBg: "#e3f2fd",
    iconColor: "#1976d2",
    title: "New Order Placed",
    message: "Order #ORD12345 worth ₹1,250 has been placed by Riya Sharma.",
    time: "10:30 AM",
    unread: true,
    sellerId: null,
  },
];

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ShopProvider({ children }) {

  // ── Core state ─────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [orders, setOrders] = useState(initialOrders);
  const [sellerProducts, setSellerProducts] = useState(initialProducts);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [deliveryPartners] = useState(initialDeliveryPartners);
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [customerWallet, setCustomerWallet] = useState(0);
  const [refundHistory, setRefundHistory] = useState([]);

  // Ref to hold syncCustomerData — avoids temporal dead zone in callbacks
  // that are defined before syncCustomerData is declared.
  const syncCustomerDataRef = useRef(null);

  const [commissionRecords, setCommissionRecords] = useState([
    {
      id: "COM001",
      orderId: "#ORD12345",
      totalAmount: 1250,
      adminCommission: 125,
      sellerEarning: 1125,
      sellerId: "SELLER001",
      sellerName: "Demo Shop",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [currentSeller, setCurrentSeller] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [sellerNotifications, setSellerNotifications] = useState(initialSellerNotifications);
  const [adminNotifications, setAdminNotifications] = useState(initialAdminNotifications);
  const [complaints, setComplaints] = useState([]);
  const [sellerReviews, setSellerReviews] = useState([]);

  // ── Seller approval state ──────────────────────────────────────────────────
  const [pendingSellers, setPendingSellers] = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [rejectedSellers, setRejectedSellers] = useState([]);

  // Use a ref to always access the latest seller lists inside callbacks
  // without needing them as deps (avoids stale-closure bugs in approve/reject).
  const pendingSellersRef = useRef(pendingSellers);
  const rejectedSellersRef = useRef(rejectedSellers);

  // Keep refs in sync
  pendingSellersRef.current = pendingSellers;
  rejectedSellersRef.current = rejectedSellers;

  // Duplicate addAddress removed; using async version defined later


  const selectAddress = useCallback((addressId) => {
    setSelectedAddressId(addressId);
  }, []);

  const addAdminNotification = useCallback(
    (title, message, type = "info", extra = {}) => {
      const iconMap = {
        approval: { icon: "storefront-outline", iconBg: "#e8f5e9", iconColor: "#16A34A" },
        order: { icon: "receipt-outline", iconBg: "#e3f2fd", iconColor: "#1976d2" },
        complaint: { icon: "alert-circle-outline", iconBg: "#fdecea", iconColor: "#EF4444" },
        payout: { icon: "wallet-outline", iconBg: "#fff8e1", iconColor: "#F97316" },
        product: { icon: "cube-outline", iconBg: "#f3e5f5", iconColor: "#7b1fa2" },
        alert: { icon: "warning-outline", iconBg: "#fdecea", iconColor: "#EF4444" },
        report: { icon: "bar-chart-outline", iconBg: "#e3f2fd", iconColor: "#1976d2" },
        user: { icon: "person-outline", iconBg: "#f3e5f5", iconColor: "#7b1fa2" },
      };
      const iconConfig = iconMap[type] ?? {
        icon: "notifications-outline",
        iconBg: "#EFF6FF",
        iconColor: "#2563EB",
      };
      setAdminNotifications((prev) => [
        {
          id: `AN${Date.now()}`,
          type,
          ...iconConfig,
          title,
          message,
          time: "Just now",
          unread: true,
          ...extra,
        },
        ...prev,
      ]);
    },
    []
  );

  const addSellerNotification = useCallback((title, message, type = "info", extra = {}) => {
    const iconMap = {
      approval: { icon: "storefront-outline", iconBg: "#e8f5e9", iconColor: "#16A34A" },
      order: { icon: "receipt-outline", iconBg: "#e3f2fd", iconColor: "#1976d2" },
      complaint: { icon: "alert-circle-outline", iconBg: "#fdecea", iconColor: "#EF4444" },
      payout: { icon: "wallet-outline", iconBg: "#fff8e1", iconColor: "#F97316" },
      product: { icon: "cube-outline", iconBg: "#f3e5f5", iconColor: "#7b1fa2" },
      alert: { icon: "warning-outline", iconBg: "#fdecea", iconColor: "#EF4444" },
      report: { icon: "bar-chart-outline", iconBg: "#e3f2fd", iconColor: "#1976d2" },
      user: { icon: "person-outline", iconBg: "#f3e5f5", iconColor: "#7b1fa2" },
    };
    const iconConfig = iconMap[type] ?? {
      icon: "notifications-outline",
      iconBg: "#EFF6FF",
      iconColor: "#2563EB",
    };
    setSellerNotifications((prev) => [
      {
        id: `SN${Date.now()}`,
        type,
        title,
        message,
        time: "Just now",
        read: false,
        ...iconConfig,
        ...extra,
      },
      ...prev,
    ]);
  }, []);

  const markSellerNotificationRead = useCallback((id) => {
    setSellerNotifications((prev) =>
      prev.map((n) =>
        String(n.id) === String(id) ? { ...n, read: true } : n
      )
    );
  }, []);

  const markAllSellerNotificationsRead = useCallback(() => {
    setSellerNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAdminNotificationRead = useCallback((id) => {
    setAdminNotifications((prev) =>
      prev.map((n) =>
        String(n.id) === String(id) ? { ...n, unread: false } : n
      )
    );
  }, []);

  const markAllAdminNotificationsRead = useCallback(() => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  // Backwards-compat aliases
  const addNotification = addSellerNotification;
  const markNotificationRead = markSellerNotificationRead;
  const markAllNotificationsRead = markAllSellerNotificationsRead;

  // ─── Seller Registration ───────────────────────────────────────────────────
  const registerSeller = useCallback(
    ({
      name,
      shopName,
      email,
      phone,
      password,
      category,
      gst,
      description,
      address,
      documents,
    }) => {
      const newSeller = {
        id: `SELLER_${uid()}`,
        name: name ?? "Seller",
        shopName: shopName ?? `${name ?? "Seller"}'s Shop`,
        email: email ?? "",
        phone: phone ?? "",
        password: password ?? "",
        category: category ?? "General",
        gst: gst ?? "",
        description: description ?? "",
        address: address ?? {},
        documents: Array.isArray(documents) ? documents : [],
        status: "Pending",
        registeredAt: Date.now(),
        registeredAtLabel: nowLabel(),
        rating: "0.0",
        totalProducts: 0,
        totalOrders: 0,
        totalSales: "₹0",
        commission: "₹0",
        joined: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      setPendingSellers((prev) => [newSeller, ...prev]);

      addAdminNotification(
        "New Seller Registration",
        `${name ?? "Seller"} from ${shopName ?? `${name ?? "Seller"}'s Shop`} (${category ?? "General"
        }) has applied. ${Array.isArray(documents) && documents.length > 0
          ? `${documents.length} document(s) uploaded.`
          : "No documents uploaded."
        }`,
        "approval",
        { sellerId: newSeller.id }
      );

      return newSeller;
    },
    [addAdminNotification]
  );

  // ─── Fetch All Sellers (Admin) ──────────────────────────────────────────────
  const fetchAllSellers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sellers/all`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const pending = [];
        const approved = [];
        const rejected = [];

        json.data.forEach((s) => {
          const docs = [];
          if (s.aadharDocPath) docs.push({ type: "Aadhar", path: s.aadharDocPath });
          if (s.panDocPath) docs.push({ type: "PAN", path: s.panDocPath });
          if (s.businessProofPath) docs.push({ type: "Business", path: s.businessProofPath });
          if (s.bankDetailsPath) docs.push({ type: "Bank", path: s.bankDetailsPath });

          let frontendStatus = "Pending";
          if (s.approvalStatus === "APPROVED") frontendStatus = "Approved";
          if (s.approvalStatus === "REJECTED") frontendStatus = "Rejected";

          const seller = {
            id: String(s.id),
            name: s.fullName,
            email: s.email,
            phone: s.phone,
            shopName: s.shopName,
            category: s.businessType,
            gst: s.gstin,
            description: s.description,
            address: {
              city: s.city,
              state: s.state,
              pinCode: s.pinCode,
              addressLine1: s.address,
              addressLine2: s.address2
            },
            documents: docs,
            status: frontendStatus,
            rejectionReason: s.rejectionReason,
            registeredAtLabel: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A"
          };

          if (frontendStatus === "Pending") pending.push(seller);
          else if (frontendStatus === "Approved") approved.push(seller);
          else if (frontendStatus === "Rejected") rejected.push(seller);
        });

        setPendingSellers(pending);
        setApprovedSellers(approved);
        setRejectedSellers(rejected);
      }
    } catch (err) {
      console.error("fetchAllSellers error", err);
    }
  }, []);

  // ─── Admin Approves Seller ─────────────────────────────────────────────────
  const approveSeller = useCallback(
    async (sellerId) => {
      const id = String(sellerId);

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/sellers/${id}/approve`, {
          method: "POST"
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to approve seller");
        }
      } catch (err) {
        console.error("Approve API Error", err);
        throw err;
      }

      let approvedSeller = null;

      const pendingMatch = pendingSellersRef.current.find(
        (s) => String(s.id) === id
      );
      if (pendingMatch) {
        approvedSeller = {
          ...pendingMatch,
          status: "Approved",
          approvedAt: Date.now(),
          approvedAtLabel: nowLabel(),
        };
        setPendingSellers((prev) => prev.filter((s) => String(s.id) !== id));
      }

      if (!approvedSeller) {
        const rejectedMatch = rejectedSellersRef.current.find(
          (s) => String(s.id) === id
        );
        if (rejectedMatch) {
          approvedSeller = {
            ...rejectedMatch,
            status: "Approved",
            approvedAt: Date.now(),
            approvedAtLabel: nowLabel(),
            rejectionReason: undefined,
          };
          setRejectedSellers((prev) => prev.filter((s) => String(s.id) !== id));
        }
      }

      if (!approvedSeller) {
        fetchAllSellers();
        return;
      }

      setApprovedSellers((prev) => [approvedSeller, ...prev]);

      setAdminNotifications((prev) =>
        prev.map((n) =>
          String(n.sellerId) === id ? { ...n, unread: false } : n
        )
      );

      addAdminNotification(
        "Seller Approved ✅",
        `${approvedSeller.name} from ${approvedSeller.shopName} has been approved.`,
        "approval"
      );

      addSellerNotification(
        "Account Approved! 🎉",
        `Congratulations ${approvedSeller.name}! Your seller account has been approved. You can now log in and start selling.`,
        "approval"
      );

      return approvedSeller;
    },
    [addAdminNotification, addSellerNotification, fetchAllSellers]
  );

  // ─── Admin Rejects Seller ──────────────────────────────────────────────────
  const rejectSeller = useCallback(
    async (sellerId, reason = "Does not meet requirements") => {
      const id = String(sellerId);

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/sellers/${id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason })
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to reject seller");
        }
      } catch (err) {
        console.error("Reject API Error", err);
        throw err;
      }

      let rejectedSeller = null;

      const pendingMatch = pendingSellersRef.current.find(
        (s) => String(s.id) === id
      );
      if (pendingMatch) {
        rejectedSeller = {
          ...pendingMatch,
          status: "Rejected",
          rejectedAt: Date.now(),
          rejectedAtLabel: nowLabel(),
          rejectionReason: reason,
        };
        setPendingSellers((prev) => prev.filter((s) => String(s.id) !== id));
      }

      if (!rejectedSeller) {
        fetchAllSellers();
        return;
      }

      setRejectedSellers((prev) => [rejectedSeller, ...prev]);

      setAdminNotifications((prev) =>
        prev.map((n) =>
          String(n.sellerId) === id ? { ...n, unread: false } : n
        )
      );

      addAdminNotification(
        "Seller Rejected",
        `${rejectedSeller.name} from ${rejectedSeller.shopName} was rejected. Reason: ${reason}`,
        "alert"
      );

      addSellerNotification(
        "Application Update",
        `Your application was not approved. Reason: ${reason}. Please contact support for more details.`,
        "alert"
      );

      return rejectedSeller;
    },
    [addAdminNotification, addSellerNotification, fetchAllSellers]
  );

  // ─── Fetch Seller Data ────────────────────────────────────────────────────────
  const fetchSellerData = useCallback(async (tokenOverride) => {
    const token = tokenOverride || authToken;
    if (!token) return;
    try {
      // 1. Fetch Profile
      const profileRes = await fetch(`${API_BASE_URL}/api/seller/profile`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.success) {
        setCurrentSeller((prev) => ({
          ...prev,
          ...profileData.data,
          name: profileData.data.fullName || prev?.name,
        }));
      }

      // 2. Fetch Orders
      let formattedOrders = [];
      const ordersRes = await fetch(`${API_BASE_URL}/api/seller/orders`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const ordersData = await ordersRes.json();
      if (ordersRes.ok && ordersData.success) {
        formattedOrders = ordersData.data.map(o => ({
          id: o.id,
          title: o.items?.[0]?.name || "Order",
          customer: o.address?.fullName || "Customer",
          customerPhone: o.address?.phone || "",
          address: o.address,
          amount: o.totalAmount,
          date: o.createdAt || new Date().toISOString(),
          status: mapOrderStatus(o.status),
          image: o.items?.[0]?.image ? `${API_BASE_URL}${o.items[0].image}` : null,
          items: o.items ? o.items.map(item => ({
            ...item,
            finalPrice: typeof item.finalPrice === 'number' ? `₹${item.finalPrice}` : item.finalPrice,
            price: typeof item.price === 'number' ? `₹${item.price}` : item.price,
            image: item.image ? `${API_BASE_URL}${item.image}` : null,
          })) : [],
        }));
        setOrders(formattedOrders);
      }

      // 3. Fetch Products
      const productsRes = await fetch(`${API_BASE_URL}/api/products/all`);
      const productsData = await productsRes.json();
      if (productsRes.ok && productsData.success && profileData.data) {
        const sellerId = profileData.data.id;
        const myProducts = productsData.data.filter(p => String(p.sellerId) === String(sellerId));
        const mappedProducts = myProducts.map(p => ({
          id: p.id.toString(),
          name: p.name,
          price: `₹${p.price}`,
          discount: p.discountPercent || 0,
          image: p.imagePath ? `${API_BASE_URL}/api/files/${p.imagePath}` : null,
          stock: p.stock,
          category: p.category,
          subcategory: p.subcategory || "",
          description: p.description,
          sellerId: p.sellerId,
          sellerName: p.sellerName,
          active: p.isActive,
          status: p.isActive ? "Live" : "Inactive",
        }));
        setSellerProducts(mappedProducts);
      }
      // 4. Fetch Returns
      try {
        const returnsRes = await fetch(`${API_BASE_URL}/api/returns/seller`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const returnsData = await returnsRes.json();
        if (returnsRes.ok && returnsData.success) {
          const mapped = returnsData.data.map(item => mapApiReturn(item, formattedOrders || []));
          setReturnRequests(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch seller returns:", err);
      }

      // 5. Fetch Complaints
      try {
        const complaintsRes = await fetch(`${API_BASE_URL}/api/complaints/seller`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const complaintsData = await complaintsRes.json();
        if (complaintsRes.ok && complaintsData.success) {
          const mapped = complaintsData.data.map(item => mapApiComplaint(item, formattedOrders || []));
          setComplaints(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch seller complaints:", err);
      }

      // 6. Fetch Ratings/Reviews
      try {
        const reviewsRes = await fetch(`${API_BASE_URL}/api/reviews/seller`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const reviewsData = await reviewsRes.json();
        if (reviewsRes.ok && reviewsData.success) {
          setSellerReviews(reviewsData.data);
        }
      } catch (err) {
        console.error("Failed to fetch seller reviews:", err);
      }
    } catch (err) {
      console.error("[fetchSellerData] error:", err);
    }
  }, [authToken]);

  // ─── Seller Login ──────────────────────────────────────────────────────────
  const loginSeller = useCallback(
    async (emailOrPhone, password) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/seller/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrPhone, password }),
        });
        const json = await res.json();
        if (json.success) {
          setCurrentSeller(json.data);
          setAuthToken(json.token);
          await fetchSellerData(json.token);
          return json.data;
        } else {
          return { error: "auth_failed", message: json.message };
        }
      } catch (err) {
        return { error: "network_error", message: "Failed to connect to server." };
      }
    },
    [fetchSellerData]
  );

  const logoutSeller = useCallback(() => {
    setCurrentSeller(null);
    setAuthToken(null);
  }, []);

  // ─── Products ──────────────────────────────────────────────────────────────
  const addSellerProduct = useCallback(
    (product) => {
      const seller = product.sellerId
        ? { sellerId: product.sellerId, sellerName: product.sellerName }
        : currentSeller
          ? {
            sellerId: currentSeller.id,
            sellerName: currentSeller.shopName ?? currentSeller.name,
          }
          : { sellerId: "SELLER001", sellerName: "Demo Shop" };

      const newProduct = normalizeProduct({
        ...product,
        ...seller,
        active: true,
        visibleToCustomer: true,
        status: "Live",
      });

      setSellerProducts((prev) => [newProduct, ...prev]);

      addSellerNotification(
        "Product is live",
        `${newProduct.name} is now visible to customers.`,
        "product"
      );
      addAdminNotification(
        "New Product Listed",
        `${newProduct.name} listed by ${newProduct.sellerName}.`,
        "product"
      );

      return newProduct;
    },
    [addSellerNotification, addAdminNotification, currentSeller]
  );

  const addSellerProductPending = useCallback(
    (product) => {
      const seller = currentSeller
        ? {
          sellerId: currentSeller.id,
          sellerName: currentSeller.shopName ?? currentSeller.name,
        }
        : { sellerId: "SELLER001", sellerName: "Demo Shop" };

      const pendingProduct = normalizeProduct({
        ...product,
        ...seller,
        active: false,
        visibleToCustomer: false,
        status: "Pending Approval",
        paymentStatus: product.paymentStatus ?? "Paid",
        uploadFee: product.uploadFee ?? 0,
        paymentMethod: product.paymentMethod ?? "upi",
        paidAt: product.paidAt ?? new Date().toISOString(),
      });

      setPendingProducts((prev) => [pendingProduct, ...prev]);
      setSellerProducts((prev) => [pendingProduct, ...prev]);

      addSellerNotification(
        "Product Under Review 🕐",
        `"${pendingProduct.name}" submitted. Admin will approve within 24 hours.`,
        "product"
      );
      addAdminNotification(
        "New Product Awaiting Approval 🔔",
        `Seller submitted "${pendingProduct.name}" after paying ₹${pendingProduct.uploadFee}. Review required.`,
        "product",
        { productId: pendingProduct.id }
      );

      return pendingProduct;
    },
    [addSellerNotification, addAdminNotification, currentSeller]
  );

  const approveSellerProduct = useCallback(
    (productId) => {
      const id = String(productId);
      let approvedProduct = null;

      setPendingProducts((prev) =>
        prev.filter((p) => {
          if (String(p.id) === id) {
            approvedProduct = p;
            return false;
          }
          return true;
        })
      );

      setSellerProducts((prev) =>
        prev.map((p) =>
          String(p.id) === id
            ? {
              ...p,
              active: true,
              visibleToCustomer: true,
              status: "Live",
              approvedAt: new Date().toISOString(),
            }
            : p
        )
      );

      if (approvedProduct) {
        addSellerNotification(
          "Product Approved! 🎉",
          `"${approvedProduct.name}" is now live and visible to customers.`,
          "product"
        );
        addAdminNotification(
          "Product Approved",
          `"${approvedProduct.name}" has been approved and is now live.`,
          "product"
        );
      }

      return approvedProduct;
    },
    [addSellerNotification, addAdminNotification]
  );

  const rejectSellerProduct = useCallback(
    (productId, reason = "Does not meet quality standards") => {
      const id = String(productId);
      let rejectedProduct = null;

      setPendingProducts((prev) =>
        prev.filter((p) => {
          if (String(p.id) === id) {
            rejectedProduct = p;
            return false;
          }
          return true;
        })
      );

      setSellerProducts((prev) =>
        prev.map((p) =>
          String(p.id) === id
            ? { ...p, status: "Rejected", active: false, visibleToCustomer: false }
            : p
        )
      );

      if (rejectedProduct) {
        addSellerNotification(
          "Product Rejected",
          `"${rejectedProduct.name}" was rejected. Reason: ${reason}.`,
          "product"
        );
      }
    },
    [addSellerNotification]
  );

  const updateSellerProduct = useCallback(
    (productId, updates = {}) => {
      let updatedProduct = null;
      setSellerProducts((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(productId)) return item;
          updatedProduct = normalizeProduct({
            ...item,
            ...updates,
            id: item.id,
            createdAt: item.createdAt,
            updatedAt: new Date().toISOString(),
          });
          return updatedProduct;
        })
      );
      addSellerNotification(
        "Product updated",
        `${updates.name ?? "Product"} updated successfully.`,
        "product"
      );
      return updatedProduct;
    },
    [addSellerNotification]
  );

  const removeSellerProduct = useCallback((productId) => {
    setSellerProducts((prev) =>
      prev.filter((item) => String(item.id) !== String(productId))
    );
  }, []);

  const deleteSellerProduct = removeSellerProduct;

  const toggleProductVisibility = useCallback((productId) => {
    setSellerProducts((prev) =>
      prev.map((item) =>
        String(item.id) === String(productId)
          ? {
            ...item,
            visibleToCustomer: !item.visibleToCustomer,
            status: !item.visibleToCustomer ? "Live" : "Hidden",
            updatedAt: new Date().toISOString(),
          }
          : item
      )
    );
  }, []);

  const toggleSellerProductActive = useCallback((productId) => {
    setSellerProducts((prev) =>
      prev.map((item) =>
        String(item.id) === String(productId)
          ? {
            ...item,
            active: !item.active,
            visibleToCustomer: !item.active,
            status: !item.active ? "Live" : "Hidden",
            updatedAt: new Date().toISOString(),
          }
          : item
      )
    );
  }, []);

  // ─── Complaints ────────────────────────────────────────────────────────────
  const submitComplaint = useCallback(
    async ({ title, description, orderId, productName, customer, sellerId, sellerName }) => {
      if (authToken && currentCustomer) {
        try {
          const numericOrderId = typeof orderId === 'string' ? Number(orderId.replace("#ORD", "")) : Number(orderId);
          const res = await fetch(`${API_BASE_URL}/api/complaints`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: numericOrderId,
              subject: title || "Customer Complaint",
              description
            }),
          });
          const json = await res.json();
          if (json.success) {
            // Use the ref to avoid temporal dead zone
            await syncCustomerDataRef.current?.(authToken);
            return json.data;
          } else {
            alert(json.message || "Failed to submit complaint.");
          }
        } catch (err) {
          console.error("submitComplaint error:", err);
        }
        return null;
      } else {
        const complaint = {
          id: `CMP${Date.now()}`,
          title: title ?? "Customer Complaint",
          description: description ?? "A complaint has been raised.",
          orderId: orderId ?? "",
          productName: productName ?? "",
          customer: customer ?? "Customer",
          sellerId: sellerId ?? null,
          sellerName: sellerName ?? "Seller",
          time: "Just now",
          read: false,
          status: "Pending",
          adminForwarded: false,
          createdAt: new Date().toISOString(),
        };
        setComplaints((prev) => [complaint, ...prev]);
        addAdminNotification(
          "New Customer Complaint",
          `${customer ?? "A customer"} raised a complaint${productName ? ` about "${productName}"` : ""
          }.`,
          "complaint",
          { complaintId: complaint.id, orderId, sellerId }
        );
        return complaint;
      }
    },
    [authToken, currentCustomer, addAdminNotification]
  );

  const addComplaintNotification = useCallback(
    ({ title, description, orderId, productName, customer, sellerId }) =>
      submitComplaint({ title, description, orderId, productName, customer, sellerId }),
    [submitComplaint]
  );

  const forwardComplaintToSeller = useCallback(
    (complaintId) => {
      let forwardedComplaint = null;
      setComplaints((prev) =>
        prev.map((c) => {
          if (String(c.id) === String(complaintId)) {
            forwardedComplaint = {
              ...c,
              status: "Forwarded to Seller",
              adminForwarded: true,
              forwardedAt: new Date().toISOString(),
            };
            return forwardedComplaint;
          }
          return c;
        })
      );
      if (forwardedComplaint) {
        addSellerNotification(
          "Complaint Forwarded to You 🔔",
          `Admin forwarded a complaint from ${forwardedComplaint.customer}. Please review.`,
          "complaint"
        );
        addAdminNotification(
          "Complaint Forwarded",
          `Complaint ${complaintId} forwarded to seller.`,
          "complaint"
        );
      }
      return forwardedComplaint;
    },
    [addSellerNotification, addAdminNotification]
  );

  const resolveComplaint = useCallback(
    (complaintId, resolution = "Issue resolved by seller") => {
      setComplaints((prev) =>
        prev.map((c) =>
          String(c.id) === String(complaintId)
            ? {
              ...c,
              status: "Resolved",
              read: true,
              resolution,
              resolvedAt: new Date().toISOString(),
            }
            : c
        )
      );
      addAdminNotification(
        "Complaint Resolved ✅",
        `Complaint resolved. Resolution: ${resolution}`,
        "complaint"
      );
    },
    [addAdminNotification]
  );

  const markComplaintRead = useCallback((complaintId) => {
    setComplaints((prev) =>
      prev.map((c) =>
        String(c.id) === String(complaintId) ? { ...c, read: true } : c
      )
    );
  }, []);

  // ─── Active Products Fetch ──────────────────────────────────────────────────
  const fetchActiveProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/all`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(p => normalizeProduct({
          id: p.id,
          name: p.name,
          price: `₹${p.price}`,
          discount: p.discount,
          image: p.image ? `${API_BASE_URL}${p.image}` : null,
          stock: p.stock,
          category: p.category,
          subcategory: p.subcategory,
          description: p.description,
          sellerId: p.sellerId,
          sellerName: p.sellerName,
          active: p.active,
          visibleToCustomer: p.visibleToCustomer,
          sku: p.sku,
          weight: p.weight,
          size: p.size,
          material: p.material,
          color: p.color,
          delivery: p.delivery,
          returnPolicy: p.returnPolicy,
        }));
        setSellerProducts(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }, []);

  // ─── Customer Data Sync ───────────────────────────────────────────────────
  const syncCustomerData = useCallback(async (token) => {
    if (!token) return;
    // Keep ref updated so callbacks defined before this can use it
    // (ref assignment inside is fine — React does not re-render on ref writes)
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 1. Fetch Cart
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/cart`, { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mappedCart = json.data.map(item => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price: `₹${item.product.price}`,
          discount: item.product.discountPercent,
          finalPrice: `₹${item.product.finalPrice}`,
          qty: item.quantity,
          sellerName: item.product.sellerName,
          seller: item.product.sellerName,
          image: item.product.image ? `${API_BASE_URL}${item.product.image}` : null,
        }));
        setCartItems(mappedCart);
      }
    } catch (err) {
      console.error("Failed to fetch customer cart:", err);
    }

    // 2. Fetch Wishlist
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/wishlist`, { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mappedWishlist = json.data.map(item => ({
          id: item.product.id,
          wishlistItemId: item.id,
          productId: item.product.id,
          name: item.product.name,
          price: `₹${item.product.price}`,
          discount: item.product.discountPercent,
          finalPrice: `₹${item.product.finalPrice}`,
          sellerName: item.product.sellerName,
          seller: item.product.sellerName,
          image: item.product.image ? `${API_BASE_URL}${item.product.image}` : null,
          rating: item.product.rating || 4.5,
          description: item.product.description,
          stock: item.product.stock,
          category: item.product.category,
        }));
        setWishlistItems(mappedWishlist);
      }
    } catch (err) {
      console.error("Failed to fetch customer wishlist:", err);
    }

    // 3. Fetch Orders
    let mappedOrders = [];
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/orders`, { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        mappedOrders = json.data.map(ord => ({
          id: `#ORD${ord.id}`,
          orderId: ord.id,
          customerId: ord.customerId,
          addressId: ord.addressId,
          address: ord.address,
          products: ord.items ? ord.items.map(item => ({
            id: item.productId,
            name: item.name,
            price: `₹${item.price}`,
            discount: item.discountPercent,
            finalPrice: `₹${item.finalPrice}`,
            qty: item.quantity,
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            image: item.image ? `${API_BASE_URL}${item.image}` : null,
          })) : [],
          price: `₹${ord.totalAmount}`,
          totalAmount: ord.totalAmount,
          status: mapOrderStatus(ord.status),
          payment: ord.paymentMethod === "COD" ? "Cash on Delivery" : `${ord.paymentMethod} Paid`,
          paymentMethod: ord.paymentMethod,
          paymentStatus: ord.paymentStatus,
          createdAt: ord.createdAt,
          updatedAt: ord.updatedAt,
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Failed to fetch customer orders:", err);
    }

    // 4. Fetch Addresses
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/addresses`, { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAddresses(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch customer addresses:", err);
    }

    // 5. Fetch Returns
    try {
      const res = await fetch(`${API_BASE_URL}/api/returns/my`, { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(item => mapApiReturn(item, mappedOrders || []));
        setReturnRequests(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch customer returns:", err);
    }

    // 6. Fetch Complaints
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/my`, { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(item => mapApiComplaint(item, mappedOrders || []));
        setComplaints(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch customer complaints:", err);
    }
  }, []);

  // Keep the ref pointing at the latest syncCustomerData so
  // callbacks defined earlier (e.g. submitComplaint) can call it safely.
  syncCustomerDataRef.current = syncCustomerData;

  // ─── Customer Auth ────────────────────────────────────────────────────────
  const loginCustomer = useCallback(
    async (emailOrPhone, password) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/customer/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailOrPhone, password }),
        });
        const json = await res.json();
        if (json.success) {
          setCurrentCustomer(json.data);
          setAuthToken(json.token);
          await syncCustomerData(json.token);
          return json.data;
        } else {
          return { error: "auth_failed", message: json.message };
        }
      } catch (err) {
        return { error: "network_error", message: "Failed to connect to server." };
      }
    },
    [syncCustomerData]
  );

  const logoutCustomer = useCallback(() => {
    setCurrentCustomer(null);
    setAuthToken(null);
    setCartItems([]);
    setWishlistItems([]);
    setOrders([]);
    setAddresses([]);
  }, []);

  const updateCustomerProfile = useCallback(
    async (form) => {
      if (!authToken) return null;
      try {
        const res = await fetch(`${API_BASE_URL}/api/customer/profile`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.name || form.fullName,
            phone: form.phone,
            dateOfBirth: form.dateOfBirth || "",
            gender: form.gender || "",
          }),
        });
        const json = await res.json();
        if (json.success) {
          setCurrentCustomer(json.data);
          return json.data;
        } else {
          alert(json.message || "Failed to update profile.");
        }
      } catch (err) {
        console.error(err);
      }
      return null;
    },
    [authToken]
  );

  // ─── Address CRUD ──────────────────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/addresses`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAddresses(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [authToken]);

  const addAddress = useCallback(async (form) => {
    if (!authToken) return null;
    try {
      const payload = {
        label: form.type,
        fullName: form.name,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        isDefault: form.isDefault,
      };
      const res = await fetch(`${API_BASE_URL}/api/customer/addresses`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        await fetchAddresses();
        return json.data;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }, [authToken, fetchAddresses]);

  const updateAddress = useCallback(async (id, form) => {
    if (!authToken) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/addresses/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        await fetchAddresses();
        return json.data;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }, [authToken, fetchAddresses]);

  const deleteAddress = useCallback(async (id) => {
    if (!authToken) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/addresses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (json.success) {
        await fetchAddresses();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  }, [authToken, fetchAddresses]);

  // ─── React Effect to fetch active products on mount ────────────────────────
  React.useEffect(() => {
    fetchActiveProducts();
  }, [fetchActiveProducts]);

  // ─── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = useCallback(async (product) => {
    if (!product) return;
    const productId = product.id;

    if (authToken && currentCustomer) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/customer/cart`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, quantity: 1 }),
        });
        const json = await res.json();
        if (json.success) {
          await syncCustomerData(authToken);
        } else {
          alert(json.message || "Failed to add to cart");
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const productIdStr = String(productId ?? product.name ?? Date.now());
      setCartItems((prev) => {
        const exists = prev.find((item) => String(item.id) === productIdStr);
        if (exists) {
          return prev.map((item) =>
            String(item.id) === productIdStr
              ? { ...item, qty: (item.qty ?? 1) + 1 }
              : item
          );
        }
        return [...prev, { ...product, id: productIdStr, qty: 1 }];
      });
    }
  }, [authToken, currentCustomer, syncCustomerData]);

  const removeFromCart = useCallback(async (cartItemId) => {
    if (authToken && currentCustomer) {
      try {
        let idToDelete = cartItemId;
        const exists = cartItems.find(item => item.id === cartItemId);
        if (!exists) {
          const prodExists = cartItems.find(item => item.productId === cartItemId);
          if (prodExists) {
            idToDelete = prodExists.id;
          }
        }
        await fetch(`${API_BASE_URL}/api/customer/cart/${idToDelete}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });
        await syncCustomerData(authToken);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems((prev) =>
        prev.filter((item) => String(item.id) !== String(cartItemId))
      );
    }
  }, [authToken, currentCustomer, cartItems, syncCustomerData]);

  const increaseQty = useCallback(async (cartItemId) => {
    if (authToken && currentCustomer) {
      const item = cartItems.find(i => i.id === cartItemId);
      if (item) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/customer/cart/${item.id}?quantity=${item.qty + 1}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${authToken}`,
            },
          });
          const json = await res.json();
          if (json.success) {
            await syncCustomerData(authToken);
          } else {
            alert(json.message);
          }
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          String(item.id) === String(cartItemId)
            ? { ...item, qty: (item.qty ?? 1) + 1 }
            : item
        )
      );
    }
  }, [authToken, currentCustomer, cartItems, syncCustomerData]);

  const decreaseQty = useCallback(async (cartItemId) => {
    if (authToken && currentCustomer) {
      const item = cartItems.find(i => i.id === cartItemId);
      if (item) {
        if (item.qty <= 1) {
          await removeFromCart(cartItemId);
        } else {
          try {
            const res = await fetch(`${API_BASE_URL}/api/customer/cart/${item.id}?quantity=${item.qty - 1}`, {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${authToken}`,
              },
            });
            const json = await res.json();
            if (json.success) {
              await syncCustomerData(authToken);
            } else {
              alert(json.message);
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    } else {
      setCartItems((prev) =>
        prev
          .map((item) =>
            String(item.id) === String(cartItemId)
              ? { ...item, qty: Math.max((item.qty ?? 1) - 1, 0) }
              : item
          )
          .filter((item) => item.qty > 0)
      );
    }
  }, [authToken, currentCustomer, cartItems, removeFromCart, syncCustomerData]);

  const clearCart = useCallback(async () => {
    if (authToken && currentCustomer) {
      try {
        await fetch(`${API_BASE_URL}/api/customer/cart`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });
        await syncCustomerData(authToken);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems([]);
    }
  }, [authToken, currentCustomer, syncCustomerData]);

  // ─── Wishlist ──────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback(async (product) => {
    if (!product) return;
    const productId = product.id;

    if (authToken && currentCustomer) {
      const existing = wishlistItems.find(item => item.id === productId || item.productId === productId);
      if (existing) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/customer/wishlist/${existing.wishlistItemId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${authToken}`,
            },
          });
          const json = await res.json();
          if (json.success) {
            await syncCustomerData(authToken);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          const res = await fetch(`${API_BASE_URL}/api/customer/wishlist?productId=${productId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${authToken}`,
            },
          });
          const json = await res.json();
          if (json.success) {
            await syncCustomerData(authToken);
          }
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      const productIdStr = String(productId ?? product.name ?? Date.now());
      setWishlistItems((prev) => {
        const exists = prev.find((item) => String(item.id) !== productIdStr);
        if (exists) return prev.filter((item) => String(item.id) !== productIdStr);
        return [...prev, { ...product, id: productIdStr }];
      });
    }
  }, [authToken, currentCustomer, wishlistItems, syncCustomerData]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (authToken && currentCustomer) {
      const existing = wishlistItems.find(item => item.id === productId || item.productId === productId || item.wishlistItemId === productId);
      if (existing) {
        try {
          await fetch(`${API_BASE_URL}/api/customer/wishlist/${existing.wishlistItemId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${authToken}`,
            },
          });
          await syncCustomerData(authToken);
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      setWishlistItems((prev) =>
        prev.filter((item) => String(item.id) !== String(productId))
      );
    }
  }, [authToken, currentCustomer, wishlistItems, syncCustomerData]);

  const isInWishlist = useCallback(
    (productId) =>
      wishlistItems.some((item) => String(item.id) === String(productId) || String(item.productId) === String(productId)),
    [wishlistItems]
  );

  // ─── Orders ────────────────────────────────────────────────────────────────
  const createOrder = useCallback(
    async ({
      items = [],
      paymentMethod = "COD",
      deliveryCharge = 40,
      address = {},
      clearOrderedCart = false,
    }) => {
      if (authToken && currentCustomer) {
        let addressId = address.id;
        if (!addressId) {
          const activeAddress = (selectedAddressId ? addresses.find((a) => String(a.id) === String(selectedAddressId)) : null) || addresses.find(a => a.isDefault) || addresses[0];
          if (activeAddress) addressId = activeAddress.id;
        }

        if (!addressId) {
          alert("Please add a delivery address first.");
          return null;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/customer/orders`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ addressId, paymentMethod }),
          });
          const json = await res.json();
          if (json.success) {
            await syncCustomerData(authToken);
            const ord = json.data;
            return {
              id: `#ORD${ord.id}`,
              orderId: ord.id,
              customerId: ord.customerId,
              addressId: ord.addressId,
              address: ord.address,
              products: ord.items ? ord.items.map(item => ({
                id: item.productId,
                name: item.name,
                price: `₹${item.price}`,
                discount: item.discountPercent,
                finalPrice: `₹${item.finalPrice}`,
                qty: item.quantity,
                sellerId: item.sellerId,
                sellerName: item.sellerName,
                image: item.image ? `${API_BASE_URL}${item.image}` : null,
              })) : [],
              price: `₹${ord.totalAmount}`,
              totalAmount: ord.totalAmount,
              status: mapOrderStatus(ord.status),
              payment: ord.paymentMethod === "COD" ? "Cash on Delivery" : `${ord.paymentMethod} Paid`,
              paymentMethod: ord.paymentMethod,
              paymentStatus: ord.paymentStatus,
              createdAt: ord.createdAt,
              updatedAt: ord.updatedAt,
              razorpayOrderId: ord.razorpayOrderId,
              razorpayKeyId: ord.razorpayKeyId,
              amount: ord.amount,
              currency: ord.currency,
            };
          } else {
            alert(json.message);
          }
        } catch (err) {
          console.error(err);
        }
        return null;
      } else {
        const safeItems = Array.isArray(items) ? items : [];
        if (safeItems.length === 0) return null;

        const itemTotal = safeItems.reduce(
          (total, item) =>
            total + cleanPrice(item.finalPrice ?? item.price) * (item.qty ?? 1),
          0
        );
        const totalAmount = itemTotal + deliveryCharge;
        const adminCommission = Math.round(totalAmount * 0.1);
        const sellerEarning = totalAmount - adminCommission;

        const order = {
          id: `#ORD${Date.now().toString().slice(-5)}`,
          title:
            safeItems.length === 1
              ? safeItems[0]?.name ?? "Product Order"
              : `${safeItems.length} Products Order`,
          customer: address?.name ?? "Customer",
          customerPhone: address?.phone ?? "",
          status: "Processing",
          deliveryStatus: "Need Delivery",
          deliveryPersonId: null,
          deliveryPersonName: "",
          deliveryFee: 0,
          date: "Today",
          price: formatPrice(totalAmount),
          payment:
            paymentMethod === "COD"
              ? "Cash on Delivery"
              : `${paymentMethod} Paid`,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
          itemTotal,
          deliveryCharge,
          totalAmount,
          adminCommission,
          sellerEarning,
          commissionRate: 10,
          items: safeItems.length,
          products: safeItems,
          returns: {},
          reviews: {},
          address,
          createdAt: new Date().toISOString(),
        };

        setOrders((prev) => [order, ...prev]);

        const sellerId = safeItems[0]?.sellerId ?? currentSeller?.id ?? "SELLER001";
        const sellerName = safeItems[0]?.sellerName ?? currentSeller?.shopName ?? "Demo Shop";

        setCommissionRecords((prev) => [
          {
            id: `COM${Date.now()}`,
            orderId: order.id,
            totalAmount,
            adminCommission,
            sellerEarning,
            sellerId,
            sellerName,
            paymentMethod,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);

        addSellerNotification(
          "New order received",
          `${order.id} placed by ${order.customer}. Earnings: ${formatPrice(sellerEarning)}.`,
          "order"
        );
        addAdminNotification(
          "New Order Placed",
          `Order ${order.id} worth ${order.price}. Commission: ${formatPrice(adminCommission)}.`,
          "order"
        );

        if (clearOrderedCart) setCartItems([]);
        return order;
      }
    },
    [authToken, currentCustomer, syncCustomerData, addresses, currentSeller, addSellerNotification, addAdminNotification]
  );

  const verifyRazorpayPayment = useCallback(
    async ({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData }) => {
      if (authToken && currentCustomer) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/customer/orders/verify-payment`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
            }),
          });
          const json = await res.json();
          if (json.success) {
            await syncCustomerData(authToken);
            const ord = json.data;
            if (orderData?.clearOrderedCart) {
              setCartItems([]);
            }
            return {
              id: `#ORD${ord.id}`,
              orderId: ord.id,
              customerId: ord.customerId,
              addressId: ord.addressId,
              address: ord.address,
              products: ord.items ? ord.items.map(item => ({
                id: item.productId,
                name: item.name,
                price: `₹${item.price}`,
                discount: item.discountPercent,
                finalPrice: `₹${item.finalPrice}`,
                qty: item.quantity,
                sellerId: item.sellerId,
                sellerName: item.sellerName,
                image: item.image ? `${API_BASE_URL}${item.image}` : null,
              })) : [],
              price: `₹${ord.totalAmount}`,
              totalAmount: ord.totalAmount,
              status: mapOrderStatus(ord.status),
              payment: ord.paymentMethod === "COD" ? "Cash on Delivery" : `${ord.paymentMethod} Paid`,
              paymentMethod: ord.paymentMethod,
              paymentStatus: ord.paymentStatus,
              createdAt: ord.createdAt,
              updatedAt: ord.updatedAt,
            };
          } else {
            console.error("Payment verification failed:", json.message);
            return null;
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          return null;
        }
      }
      return null;
    },
    [authToken, currentCustomer, syncCustomerData]
  );

  const updateOrderStatus = useCallback(
    async (orderId, status) => {
      if (authToken && currentSeller) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/seller/orders/${orderId}/status?status=${encodeURIComponent(status)}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${authToken}` }
          });
          const json = await res.json();
          if (json.success) {
            if (fetchSellerData) fetchSellerData();
          }
        } catch (err) {
          console.error(err);
        }
      }
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === String(orderId) ? { ...order, status } : order
        )
      );
      addSellerNotification(
        "Order status updated",
        `${orderId} status changed to ${status}.`,
        "order"
      );
    },
    [addSellerNotification, authToken, currentSeller, fetchSellerData]
  );

  const assignDeliveryPerson = useCallback(
    (orderId, deliveryPersonId) => {
      const partner = deliveryPartners.find(
        (p) => String(p.id) === String(deliveryPersonId)
      );
      if (!partner) return null;
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === String(orderId)
            ? {
              ...order,
              deliveryStatus: "Assigned",
              deliveryPersonId: partner.id,
              deliveryPersonName: partner.name,
              deliveryPersonPhone: partner.phone,
              deliveryFee: partner.price,
            }
            : order
        )
      );
      return partner;
    },
    [deliveryPartners]
  );

  const updateDeliveryStatus = useCallback((orderId, deliveryStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        String(order.id) === String(orderId) ? { ...order, deliveryStatus } : order
      )
    );
  }, []);

  const clearOrders = useCallback(() => setOrders([]), []);

  // ─── Returns ───────────────────────────────────────────────────────────────
  const createReturnRequest = useCallback(
    async ({ orderId, customer, product, productId, price, reason, image, productImage }) => {
      if (authToken && currentCustomer) {
        try {
          const numericOrderId = typeof orderId === 'string' ? Number(orderId.replace("#ORD", "")) : Number(orderId);
          const res = await fetch(`${API_BASE_URL}/api/returns`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: numericOrderId,
              reason: reason || "Item return requested",
              description: ""
            }),
          });
          const json = await res.json();
          if (json.success) {
            await syncCustomerData(authToken);
            return json.data;
          } else {
            alert(json.message || "Failed to submit return request.");
          }
        } catch (err) {
          console.error("createReturnRequest error:", err);
        }
        return null;
      } else {
        const refundAmount = cleanPrice(price);
        const returnId = `#RET${Date.now().toString().slice(-4)}`;
        const key = String(productId ?? product ?? returnId);

        const request = {
          id: returnId,
          orderId,
          productId: productId ?? key,
          customer: customer ?? "Customer",
          product: product ?? "Product",
          price: price ?? formatPrice(refundAmount),
          image: image ?? productImage ?? null,
          reason: reason ?? "No reason added",
          status: "Return Requested",
          requestedOn: "Today",
          refundAmount,
          refundAmountText: formatPrice(refundAmount),
          refundStatus: "Not Credited",
          refundCredited: false,
          creditedOn: null,
        };

        setReturnRequests((prev) => {
          const alreadyExists = prev.some(
            (item) =>
              String(item.orderId) === String(orderId) &&
              String(item.productId ?? item.product) === String(productId ?? product)
          );
          if (alreadyExists) return prev;
          return [request, ...prev];
        });

        setOrders((prev) =>
          prev.map((order) => {
            if (String(order.id) !== String(orderId)) return order;
            return { ...order, returns: { ...(order.returns ?? {}), [key]: request } };
          })
        );

        addSellerNotification(
          "Return requested",
          `${request.customer} requested return for ${request.product}.`,
          "return"
        );

        return request;
      }
    },
    [authToken, currentCustomer, syncCustomerData, addSellerNotification]
  );

  const updateReturnStatus = useCallback(
    async (returnId, status, sellerNote = "") => {
      if (authToken && currentSeller) {
        try {
          const numericReturnId = typeof returnId === 'string' ? Number(returnId.replace("#RET", "")) : Number(returnId);
          let res;
          let apiStatus = status;
          if (status === "Return Pickup Started") apiStatus = "PICKED_UP";
          if (status === "Product Received") apiStatus = "REFUNDED";

          if (apiStatus === "APPROVED" || apiStatus === "REJECTED") {
            res = await fetch(`${API_BASE_URL}/api/returns/${numericReturnId}/respond`, {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: apiStatus, sellerNote, refundAmount: null }),
            });
          } else {
            res = await fetch(`${API_BASE_URL}/api/returns/${numericReturnId}/status?status=${encodeURIComponent(apiStatus)}`, {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${authToken}`,
              },
            });
          }
          const json = await res.json();
          if (json.success) {
            await fetchSellerData(authToken);
          } else {
            alert(json.message || "Failed to update return status.");
          }
        } catch (err) {
          console.error("updateReturnStatus error:", err);
        }
      } else {
        let creditedRequest = null;

        setReturnRequests((prev) =>
          prev.map((item) => {
            if (String(item.id) !== String(returnId)) return item;
            if (status === "Product Received") {
              if (item.refundCredited) {
                return { ...item, status: "Product Received", refundStatus: "Credited" };
              }
              creditedRequest = {
                ...item,
                status: "Product Received",
                refundStatus: "Credited",
                refundCredited: true,
                creditedOn: "Today",
              };
              return creditedRequest;
            }
            return { ...item, status };
          })
        );

        if (status === "Product Received" && creditedRequest) {
          const amount = Number(creditedRequest.refundAmount ?? 0);
          setCustomerWallet((prev) => prev + amount);
          setRefundHistory((prev) => [
            {
              id: `RF${Date.now()}`,
              returnId: creditedRequest.id,
              orderId: creditedRequest.orderId,
              product: creditedRequest.product,
              customer: creditedRequest.customer,
              amount,
              amountText: formatPrice(amount),
              creditedOn: "Today",
              status: "Credited",
            },
            ...prev,
          ]);
          setOrders((prev) =>
            prev.map((order) => {
              if (String(order.id) !== String(creditedRequest.orderId)) return order;
              const key = String(
                creditedRequest.productId ?? creditedRequest.product ?? creditedRequest.id
              );
              return {
                ...order,
                returns: { ...(order.returns ?? {}), [key]: creditedRequest },
              };
            })
          );
          addSellerNotification(
            "Refund credited",
            `${formatPrice(amount)} credited after return received.`,
            "return"
          );
        }
      }
    },
    [authToken, currentSeller, fetchSellerData, addSellerNotification]
  );

  // ─── Reviews ───────────────────────────────────────────────────────────────
  const addProductReview = useCallback(
    async ({ orderId, productId, product, customer, rating, comment, text, images = [] }) => {
      if (authToken && currentCustomer) {
        try {
          const numericOrderId = typeof orderId === 'string' ? Number(orderId.replace("#ORD", "")) : Number(orderId);
          const numericProductId = Number(productId);
          const res = await fetch(`${API_BASE_URL}/api/reviews`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: numericOrderId,
              productId: numericProductId,
              rating: Number(rating),
              comment: comment || text || ""
            }),
          });
          const json = await res.json();
          if (json.success) {
            await syncCustomerData(authToken);
            return json.data;
          } else {
            alert(json.message || "Failed to submit review.");
          }
        } catch (err) {
          console.error("addProductReview error:", err);
        }
        return null;
      } else {
        const key = String(productId ?? product ?? Date.now());
        const review = {
          id: `REV${Date.now()}`,
          orderId,
          productId: key,
          product: product ?? "Product",
          customer: customer ?? "Customer",
          rating: Number(rating ?? 0),
          comment: comment ?? text ?? "",
          text: text ?? comment ?? "",
          images,
          createdOn: "Today",
        };

        setOrders((prev) =>
          prev.map((order) => {
            if (String(order.id) !== String(orderId)) return order;
            return {
              ...order,
              reviews: { ...(order.reviews ?? {}), [key]: review },
              products: (order.products ?? []).map((item) =>
                String(item.id ?? item.productId ?? item.name) === key
                  ? { ...item, customerReview: review }
                  : item
              ),
            };
          })
        );

        setSellerProducts((prev) =>
          prev.map((item) => {
            if (String(item.id ?? item.name) !== key) return item;
            const oldReviews = Array.isArray(item.customerReviews) ? item.customerReviews : [];
            const nextReviews = [review, ...oldReviews];
            const avgRating =
              nextReviews.reduce((sum, r) => sum + Number(r.rating ?? 0), 0) /
              nextReviews.length;
            return {
              ...item,
              customerReviews: nextReviews,
              reviews: nextReviews.length,
              rating: Number(avgRating.toFixed(1)),
            };
          })
        );

        addSellerNotification(
          "New product review",
          `${review.customer} reviewed ${review.product}.`,
          "review"
        );
        return review;
      }
    },
    [authToken, currentCustomer, syncCustomerData, addSellerNotification]
  );

  // ─── Derived values ────────────────────────────────────────────────────────
  const customerVisibleProducts = useMemo(
    () => sellerProducts.filter((item) => item.visibleToCustomer && item.active),
    [sellerProducts]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + (item.qty ?? 1), 0),
    [cartItems]
  );

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + cleanPrice(item.finalPrice ?? item.price) * (item.qty ?? 1),
        0
      ),
    [cartItems]
  );

  const ordersCount = useMemo(() => orders.length, [orders]);

  const unreadNotifications = useMemo(
    () => sellerNotifications.filter((n) => !n.read).length,
    [sellerNotifications]
  );

  const unreadAdminNotifications = useMemo(
    () => adminNotifications.filter((n) => n.unread).length,
    [adminNotifications]
  );

  const unreadComplaints = useMemo(
    () => complaints.filter((c) => !c.read).length,
    [complaints]
  );

  const totalAdminCommission = useMemo(
    () => commissionRecords.reduce((sum, r) => sum + (r.adminCommission ?? 0), 0),
    [commissionRecords]
  );

  const totalSellerPayout = useMemo(
    () => commissionRecords.reduce((sum, r) => sum + (r.sellerEarning ?? 0), 0),
    [commissionRecords]
  );

  const sellerStats = useMemo(() => {
    const totalOrders = orders.length;
    const completed = orders.filter((o) => o.status === "Delivered").length;
    const processing = orders.filter((o) => o.status === "Processing").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    const returns = returnRequests.filter((r) => r.status !== "Product Received").length;
    const liveProducts = sellerProducts.filter((p) => p.visibleToCustomer && p.active).length;
    const pendingApprovalCount = pendingProducts.length;
    const totalEarnings = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce(
        (sum, order) => sum + (order.sellerEarning ?? cleanPrice(order.price) * 0.9),
        0
      );
    return {
      totalOrders,
      completed,
      processing,
      cancelled,
      returns,
      liveProducts,
      pendingApprovalCount,
      totalEarnings,
    };
  }, [orders, returnRequests, sellerProducts, pendingProducts]);

  // ─── Messages / Chat Flow ──────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (orderId, content, senderType = "CUSTOMER") => {
      if (!authToken) return null;
      try {
        const numericOrderId = typeof orderId === 'string' ? Number(orderId.replace("#ORD", "")) : Number(orderId);
        const path = senderType.toUpperCase() === "SELLER" ? "seller" : "customer";
        const res = await fetch(`${API_BASE_URL}/api/messages/${path}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: numericOrderId, content }),
        });
        const json = await res.json();
        if (json.success) {
          return json.data;
        }
      } catch (err) {
        console.error("Failed to send message:", err);
      }
      return null;
    },
    [authToken]
  );

  const fetchChatThread = useCallback(
    async (orderId, senderType = "CUSTOMER") => {
      if (!authToken) return [];
      try {
        const numericOrderId = typeof orderId === 'string' ? Number(orderId.replace("#ORD", "")) : Number(orderId);
        const path = senderType.toUpperCase() === "SELLER" ? "seller/order" : "order";
        const res = await fetch(`${API_BASE_URL}/api/messages/${path}/${numericOrderId}`, {
          headers: { "Authorization": `Bearer ${authToken}` },
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (err) {
        console.error("Failed to fetch chat thread:", err);
      }
      return [];
    },
    [authToken]
  );

  // ─── Context value ─────────────────────────────────────────────────────────
  // FIX: Split the giant useMemo into a plain object. The previous approach
  // had a huge deps array that was error-prone. Since all the individual
  // values are already memoised (useState / useCallback / useMemo), a plain
  // object reference here is fine — React only re-renders consumers when a
  // context value changes by reference, and our state + callback refs already
  // control that correctly.
  const value = {
    sendMessage,
    fetchChatThread,
    // ── State ──
    cartItems,
    wishlistItems,
    orders,
    sellerProducts,
    pendingProducts,
    customerVisibleProducts,
    deliveryPartners,
    returnRequests,
    customerWallet,
    refundHistory,
    currentSeller,
    setCurrentSeller,
    currentCustomer,
    setCurrentCustomer,
    currentAdmin,
    setCurrentAdmin,
    authToken,
    setAuthToken,
    commissionRecords,
    totalAdminCommission,
    totalSellerPayout,
    loginCustomer,
    logoutCustomer,
    updateCustomerProfile,
    syncCustomerData,
    addresses,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
    selectedAddressId,
    isPlacingOrder,
    setIsPlacingOrder,
    pendingSellers,
    approvedSellers,
    rejectedSellers,

    // ── Notifications (seller) ──
    notifications: sellerNotifications,
    sellerNotifications,
    unreadNotifications,

    // ── Notifications (admin) ──
    adminNotifications,
    unreadAdminNotifications,

    // ── Complaints ──
    complaints,
    complaintNotifications: complaints,
    unreadComplaints,

    // ── Cart ──
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,

    // ── Wishlist ──
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,

    // ── Products ──
    addSellerProduct,
    addSellerProductPending,
    approveSellerProduct,
    rejectSellerProduct,
    updateSellerProduct,
    removeSellerProduct,
    deleteSellerProduct,
    toggleProductVisibility,
    toggleSellerProductActive,

    // ── Orders ──
    createOrder,
    verifyRazorpayPayment,
    updateOrderStatus,
    assignDeliveryPerson,
    updateDeliveryStatus,
    clearOrders,

    // ── Returns & Reviews ──
    sellerReviews,
    createReturnRequest,
    updateReturnStatus,
    addProductReview,

    // ── Seller auth ──
    registerSeller,
    approveSeller,
    rejectSeller,
    loginSeller,
    logoutSeller,
    fetchSellerData,
    fetchAllSellers,

    // ── Notification actions ──
    addNotification,
    addSellerNotification,
    markNotificationRead,
    markSellerNotificationRead,
    markAllNotificationsRead,
    markAllSellerNotificationsRead,
    addAdminNotification,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,

    // ── Complaint actions ──
    submitComplaint,
    addComplaintNotification,
    forwardComplaintToSeller,
    markComplaintRead,
    resolveComplaint,

    // ── Utilities ──
    cleanPrice,
    formatPrice,
    getDiscountedPrice,

    // ── Derived ──
    cartCount,
    wishlistCount,
    cartTotal,
    ordersCount,
    sellerStats,
  };

  return (
    <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context)
    throw new Error("useShop must be used inside ShopProvider");
  return context;
}