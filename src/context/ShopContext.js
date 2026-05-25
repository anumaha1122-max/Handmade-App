


// src/context/ShopContext.js

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";

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

const initialOrders = [
  {
    id: "#ORD12345",
    title: "Macrame Wall Hanging",
    customer: "Riya Sharma",
    customerPhone: "9000011111",
    price: "₹1,250",
    status: "Processing",
    deliveryStatus: "Need Delivery",
    deliveryPersonId: null,
    deliveryPersonName: "",
    deliveryFee: 0,
    address: {
      name: "Riya Sharma",
      line1: "Kukatpally",
      city: "Hyderabad - 500072",
    },
    products: [],
    returns: {},
    reviews: {},
    totalAmount: 1250,
    adminCommission: 125,
    sellerEarning: 1125,
    commissionRate: 10,
    paymentStatus: "Paid",
    createdAt: new Date().toISOString(),
  },
];

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
  const [cartItems, setCartItems]           = useState([]);
  const [wishlistItems, setWishlistItems]   = useState([]);
  const [orders, setOrders]                 = useState(initialOrders);
  const [sellerProducts, setSellerProducts] = useState(initialProducts);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [deliveryPartners]                  = useState(initialDeliveryPartners);
  const [returnRequests, setReturnRequests] = useState([]);
  const [customerWallet, setCustomerWallet] = useState(0);
  const [refundHistory, setRefundHistory]   = useState([]);

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

  const [currentSeller, setCurrentSeller]                 = useState(null);
  const [sellerNotifications, setSellerNotifications]     = useState(initialSellerNotifications);
  const [adminNotifications, setAdminNotifications]       = useState(initialAdminNotifications);
  const [complaints, setComplaints]                       = useState([]);

  // ── Seller approval state ──────────────────────────────────────────────────
  const [pendingSellers, setPendingSellers]   = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [rejectedSellers, setRejectedSellers] = useState([]);

  // Use a ref to always access the latest seller lists inside callbacks
  // without needing them as deps (avoids stale-closure bugs in approve/reject).
  const pendingSellersRef   = useRef(pendingSellers);
  const rejectedSellersRef  = useRef(rejectedSellers);

  // Keep refs in sync
  pendingSellersRef.current  = pendingSellers;
  rejectedSellersRef.current = rejectedSellers;

  // ─── Notification helpers ──────────────────────────────────────────────────
  const addSellerNotification = useCallback((title, message, type = "info") => {
    setSellerNotifications((prev) => [
      {
        id: `SN${Date.now()}`,
        title,
        message,
        time: "Just now",
        read: false,
        type,
      },
      ...prev,
    ]);
  }, []);

  const addAdminNotification = useCallback(
    (title, message, type = "info", extra = {}) => {
      const iconMap = {
        approval:  { icon: "storefront-outline",    iconBg: "#e8f5e9", iconColor: "#16A34A" },
        order:     { icon: "receipt-outline",        iconBg: "#e3f2fd", iconColor: "#1976d2" },
        complaint: { icon: "alert-circle-outline",   iconBg: "#fdecea", iconColor: "#EF4444" },
        payout:    { icon: "wallet-outline",         iconBg: "#fff8e1", iconColor: "#F97316" },
        product:   { icon: "cube-outline",           iconBg: "#f3e5f5", iconColor: "#7b1fa2" },
        alert:     { icon: "warning-outline",        iconBg: "#fdecea", iconColor: "#EF4444" },
        report:    { icon: "bar-chart-outline",      iconBg: "#e3f2fd", iconColor: "#1976d2" },
        user:      { icon: "person-outline",         iconBg: "#f3e5f5", iconColor: "#7b1fa2" },
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
  const addNotification          = addSellerNotification;
  const markNotificationRead     = markSellerNotificationRead;
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
        `${name ?? "Seller"} from ${shopName ?? `${name ?? "Seller"}'s Shop`} (${
          category ?? "General"
        }) has applied. ${
          Array.isArray(documents) && documents.length > 0
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

  // ─── Admin Approves Seller ─────────────────────────────────────────────────
  // FIX: Use functional updates + refs to avoid stale closures. Previously
  // setRejectedSellers was called inside setPendingSellers's updater which
  // could read a stale copy of rejectedSellers.
  const approveSeller = useCallback(
    (sellerId) => {
      const id = String(sellerId);
      let approvedSeller = null;

      // Try pending first
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

      // Try rejected (re-consider flow)
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

      if (!approvedSeller) return null;

      setApprovedSellers((prev) => [approvedSeller, ...prev]);

      // Mark related admin notifications as read
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
    [addAdminNotification, addSellerNotification]
    // intentionally NOT including pendingSellers / rejectedSellers — we use refs
  );

  // ─── Admin Rejects Seller ──────────────────────────────────────────────────
  const rejectSeller = useCallback(
    (sellerId, reason = "Does not meet requirements") => {
      const id = String(sellerId);
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

      if (!rejectedSeller) return null;

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
    [addAdminNotification, addSellerNotification]
  );

  // ─── Seller Login ──────────────────────────────────────────────────────────
  // FIX: Added null-guards on email/phone/password before comparison.
  const loginSeller = useCallback(
    (emailOrPhone, password) => {
      if (!emailOrPhone || !password) {
        return { error: "invalid_input", message: "Email/phone and password are required." };
      }

      const normalizedInput = emailOrPhone.trim().toLowerCase();

      // Check approved sellers
      const found = approvedSellers.find(
        (s) =>
          (s.email?.trim().toLowerCase() === normalizedInput ||
            s.phone?.trim() === emailOrPhone.trim()) &&
          s.password === password
      );
      if (found) {
        setCurrentSeller(found);
        return found;
      }

      // Check if pending (wrong password or correct — both get "pending" message)
      const isPending = pendingSellers.find(
        (s) =>
          s.email?.trim().toLowerCase() === normalizedInput ||
          s.phone?.trim() === emailOrPhone.trim()
      );
      if (isPending) {
        return {
          error: "pending",
          message: "Your account is pending admin approval.",
        };
      }

      // Check if rejected
      const isRejected = rejectedSellers.find(
        (s) =>
          s.email?.trim().toLowerCase() === normalizedInput ||
          s.phone?.trim() === emailOrPhone.trim()
      );
      if (isRejected) {
        return {
          error: "rejected",
          message: `Your application was rejected. Reason: ${
            isRejected.rejectionReason ?? "Does not meet requirements"
          }`,
        };
      }

      // Demo seller fallback
      if (
        normalizedInput === "demo@seller.com" ||
        emailOrPhone.trim() === "9999999999"
      ) {
        const demoSeller = {
          id: "SELLER001",
          name: "Demo Seller",
          shopName: "Demo Shop",
          email: emailOrPhone,
          phone: "",
          category: "General",
          status: "Approved",
        };
        setCurrentSeller(demoSeller);
        return demoSeller;
      }

      return { error: "not_found", message: "Invalid credentials." };
    },
    [approvedSellers, pendingSellers, rejectedSellers]
  );

  const logoutSeller = useCallback(() => setCurrentSeller(null), []);

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
    ({ title, description, orderId, productName, customer, sellerId, sellerName }) => {
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
        `${customer ?? "A customer"} raised a complaint${
          productName ? ` about "${productName}"` : ""
        }.`,
        "complaint",
        { complaintId: complaint.id, orderId, sellerId }
      );
      return complaint;
    },
    [addAdminNotification]
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

  // ─── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    if (!product) return;
    const productId = String(product.id ?? product.name ?? Date.now());
    setCartItems((prev) => {
      const exists = prev.find((item) => String(item.id) === productId);
      if (exists) {
        return prev.map((item) =>
          String(item.id) === productId
            ? { ...item, qty: (item.qty ?? 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, id: productId, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) =>
      prev.filter((item) => String(item.id) !== String(productId))
    );
  }, []);

  const increaseQty = useCallback((productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(productId)
          ? { ...item, qty: (item.qty ?? 1) + 1 }
          : item
      )
    );
  }, []);

  const decreaseQty = useCallback((productId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          String(item.id) === String(productId)
            ? { ...item, qty: Math.max((item.qty ?? 1) - 1, 0) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  // ─── Wishlist ──────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    const productId = String(product.id ?? product.name ?? Date.now());
    setWishlistItems((prev) => {
      const exists = prev.find((item) => String(item.id) === productId);
      if (exists) return prev.filter((item) => String(item.id) !== productId);
      return [...prev, { ...product, id: productId }];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((prev) =>
      prev.filter((item) => String(item.id) !== String(productId))
    );
  }, []);

  const isInWishlist = useCallback(
    (productId) =>
      wishlistItems.some((item) => String(item.id) === String(productId)),
    [wishlistItems]
  );

  // ─── Orders + Commission Split ─────────────────────────────────────────────
  const createOrder = useCallback(
    ({
      items = [],
      paymentMethod = "COD",
      deliveryCharge = 40,
      address = { name: "Customer", line1: "Customer address", city: "Hyderabad" },
      clearOrderedCart = false,
    }) => {
      const safeItems = Array.isArray(items) ? items : [];
      if (safeItems.length === 0) return null;

      const itemTotal = safeItems.reduce(
        (total, item) =>
          total + cleanPrice(item.finalPrice ?? item.price) * (item.qty ?? 1),
        0
      );
      const totalAmount      = itemTotal + deliveryCharge;
      const adminCommission  = Math.round(totalAmount * 0.1);
      const sellerEarning    = totalAmount - adminCommission;

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

      const sellerId   = safeItems[0]?.sellerId   ?? currentSeller?.id       ?? "SELLER001";
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
    },
    [addSellerNotification, addAdminNotification, currentSeller]
  );

  const updateOrderStatus = useCallback(
    (orderId, status) => {
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
    [addSellerNotification]
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
    ({ orderId, customer, product, productId, price, reason, image, productImage }) => {
      const refundAmount = cleanPrice(price);
      const returnId     = `#RET${Date.now().toString().slice(-4)}`;
      const key          = String(productId ?? product ?? returnId);

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
    },
    [addSellerNotification]
  );

  const updateReturnStatus = useCallback(
    (returnId, status) => {
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
    },
    [addSellerNotification]
  );

  // ─── Reviews ───────────────────────────────────────────────────────────────
  const addProductReview = useCallback(
    ({ orderId, productId, product, customer, rating, comment, text, images = [] }) => {
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
    },
    [addSellerNotification]
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
    const totalOrders        = orders.length;
    const completed          = orders.filter((o) => o.status === "Delivered").length;
    const processing         = orders.filter((o) => o.status === "Processing").length;
    const cancelled          = orders.filter((o) => o.status === "Cancelled").length;
    const returns            = returnRequests.filter((r) => r.status !== "Product Received").length;
    const liveProducts       = sellerProducts.filter((p) => p.visibleToCustomer && p.active).length;
    const pendingApprovalCount = pendingProducts.length;
    const totalEarnings      = orders
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

  // ─── Context value ─────────────────────────────────────────────────────────
  // FIX: Split the giant useMemo into a plain object. The previous approach
  // had a huge deps array that was error-prone. Since all the individual
  // values are already memoised (useState / useCallback / useMemo), a plain
  // object reference here is fine — React only re-renders consumers when a
  // context value changes by reference, and our state + callback refs already
  // control that correctly.
  const value = {
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
    commissionRecords,
    totalAdminCommission,
    totalSellerPayout,

    // ── Seller registration / approval ──
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
    updateOrderStatus,
    assignDeliveryPerson,
    updateDeliveryStatus,
    clearOrders,

    // ── Returns & Reviews ──
    createReturnRequest,
    updateReturnStatus,
    addProductReview,

    // ── Seller auth ──
    registerSeller,
    approveSeller,
    rejectSeller,
    loginSeller,
    logoutSeller,

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