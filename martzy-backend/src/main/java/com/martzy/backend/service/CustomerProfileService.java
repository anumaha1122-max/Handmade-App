package com.martzy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.martzy.backend.dto.AddressDTO;
import com.martzy.backend.dto.CartItemDTO;
import com.martzy.backend.dto.PlaceOrderDTO;
import com.martzy.backend.dto.UpdateProfileDTO;
import com.martzy.backend.dto.VerifyPaymentDTO;
import com.martzy.backend.model.*;
import com.martzy.backend.repository.*;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class CustomerProfileService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final CartItemRepository cartItemRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final JwtUtil jwtUtil;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Helper to resolve Customer from Authorization Token ────────────────
    public Customer getCustomerFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid authorization header.");
        }
        String t = token.substring(7).trim();
        if (!jwtUtil.isValid(t)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired session token.");
        }
        String email = jwtUtil.extractSubject(t);
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Customer account not found."));
    }

    // ── PROFILE ENDPOINTS ─────────────────────────────────────────────────
    public ApiResponse getProfile(String token) {
        Customer c = getCustomerFromToken(token);
        return ApiResponse.ok("Profile fetched successfully.", safeCustomer(c), null);
    }

    public ApiResponse updateProfile(String token, UpdateProfileDTO dto) {
        Customer c = getCustomerFromToken(token);
        
        // Check if phone matches another customer
        Optional<Customer> other = customerRepository.findByPhone(dto.getPhone());
        if (other.isPresent() && !other.get().getId().equals(c.getId())) {
            return ApiResponse.error("Phone number is already in use by another customer.");
        }

        c.setFullName(dto.getFullName().trim());
        c.setPhone(dto.getPhone().trim());
        c.setDateOfBirth(dto.getDateOfBirth());
        c.setGender(dto.getGender());

        Customer saved = customerRepository.save(c);
        return ApiResponse.ok("Profile updated successfully.", safeCustomer(saved), null);
    }

    // ── ADDRESS ENDPOINTS ─────────────────────────────────────────────────
    public ApiResponse getAddresses(String token) {
        Customer c = getCustomerFromToken(token);
        List<Address> addresses = addressRepository.findByCustomerId(c.getId());
        List<Map<String, Object>> list = addresses.stream()
                .map(this::addressToMap)
                .collect(Collectors.toList());
        return ApiResponse.ok("Addresses fetched successfully.", list, null);
    }

    @Transactional
    public ApiResponse addAddress(String token, AddressDTO dto) {
        Customer c = getCustomerFromToken(token);

        if (dto.getIsDefault()) {
            unsetAllDefaults(c.getId());
        }

        Address addr = Address.builder()
                .customerId(c.getId())
                .label(dto.getLabel().trim())
                .fullName(dto.getFullName().trim())
                .phone(dto.getPhone().trim())
                .line1(dto.getLine1().trim())
                .line2(dto.getLine2() != null ? dto.getLine2().trim() : null)
                .city(dto.getCity().trim())
                .state(dto.getState().trim())
                .pincode(dto.getPincode().trim())
                .isDefault(dto.getIsDefault())
                .build();

        Address saved = addressRepository.save(addr);
        return ApiResponse.ok("Address added successfully.", addressToMap(saved), null);
    }

    @Transactional
    public ApiResponse updateAddress(String token, Long addressId, AddressDTO dto) {
        Customer c = getCustomerFromToken(token);
        Address addr = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found."));

        if (!addr.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        if (dto.getIsDefault() && !addr.getIsDefault()) {
            unsetAllDefaults(c.getId());
        }

        addr.setLabel(dto.getLabel().trim());
        addr.setFullName(dto.getFullName().trim());
        addr.setPhone(dto.getPhone().trim());
        addr.setLine1(dto.getLine1().trim());
        addr.setLine2(dto.getLine2() != null ? dto.getLine2().trim() : null);
        addr.setCity(dto.getCity().trim());
        addr.setState(dto.getState().trim());
        addr.setPincode(dto.getPincode().trim());
        addr.setIsDefault(dto.getIsDefault());

        Address saved = addressRepository.save(addr);
        return ApiResponse.ok("Address updated successfully.", addressToMap(saved), null);
    }

    public ApiResponse deleteAddress(String token, Long addressId) {
        Customer c = getCustomerFromToken(token);
        Address addr = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found."));

        if (!addr.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        addressRepository.delete(addr);
        return ApiResponse.ok("Address deleted successfully.", null, null);
    }

    private void unsetAllDefaults(Long customerId) {
        List<Address> list = addressRepository.findByCustomerId(customerId);
        for (Address a : list) {
            if (a.getIsDefault()) {
                a.setIsDefault(false);
                addressRepository.save(a);
            }
        }
    }

    // ── CART ENDPOINTS ────────────────────────────────────────────────────
    public ApiResponse getCart(String token) {
        Customer c = getCustomerFromToken(token);
        List<CartItem> items = cartItemRepository.findByCustomerId(c.getId());
        List<Map<String, Object>> list = items.stream()
                .map(this::cartItemToMap)
                .collect(Collectors.toList());
        return ApiResponse.ok("Cart fetched successfully.", list, null);
    }

    public ApiResponse addToCart(String token, CartItemDTO dto) {
        Customer c = getCustomerFromToken(token);
        Product p = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));

        if (!p.getIsActive()) {
            return ApiResponse.error("This product is currently inactive and cannot be added to the cart.");
        }

        if (p.getStock() < dto.getQuantity()) {
            return ApiResponse.error("Insufficient stock. Only " + p.getStock() + " items available.");
        }

        Optional<CartItem> existing = cartItemRepository.findByCustomerIdAndProductId(c.getId(), p.getId());
        CartItem saved;
        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + dto.getQuantity();
            if (p.getStock() < newQty) {
                return ApiResponse.error("Cannot add more. Insufficient stock.");
            }
            item.setQuantity(newQty);
            saved = cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .customerId(c.getId())
                    .product(p)
                    .quantity(dto.getQuantity())
                    .build();
            saved = cartItemRepository.save(item);
        }

        return ApiResponse.ok("Product added to cart.", cartItemToMap(saved), null);
    }

    public ApiResponse updateCartQuantity(String token, Long cartItemId, Integer quantity) {
        Customer c = getCustomerFromToken(token);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found."));

        if (!item.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return ApiResponse.ok("Item removed from cart.", null, null);
        }

        Product p = item.getProduct();
        if (p.getStock() < quantity) {
            return ApiResponse.error("Insufficient stock. Only " + p.getStock() + " items available.");
        }

        item.setQuantity(quantity);
        CartItem saved = cartItemRepository.save(item);
        return ApiResponse.ok("Cart updated.", cartItemToMap(saved), null);
    }

    public ApiResponse removeFromCart(String token, Long cartItemId) {
        Customer c = getCustomerFromToken(token);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found."));

        if (!item.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        cartItemRepository.delete(item);
        return ApiResponse.ok("Item removed from cart successfully.", null, null);
    }

    @Transactional
    public ApiResponse clearCart(String token) {
        Customer c = getCustomerFromToken(token);
        cartItemRepository.deleteByCustomerId(c.getId());
        return ApiResponse.ok("Cart cleared successfully.", null, null);
    }

    // ── WISHLIST ENDPOINTS ────────────────────────────────────────────────
    public ApiResponse getWishlist(String token) {
        Customer c = getCustomerFromToken(token);
        List<WishlistItem> items = wishlistItemRepository.findByCustomerId(c.getId());
        List<Map<String, Object>> list = items.stream()
                .map(this::wishlistItemToMap)
                .collect(Collectors.toList());
        return ApiResponse.ok("Wishlist fetched successfully.", list, null);
    }

    public ApiResponse addToWishlist(String token, Long productId) {
        Customer c = getCustomerFromToken(token);
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));

        Optional<WishlistItem> existing = wishlistItemRepository.findByCustomerIdAndProductId(c.getId(), p.getId());
        if (existing.isPresent()) {
            return ApiResponse.ok("Product is already in your wishlist.", wishlistItemToMap(existing.get()), null);
        }

        WishlistItem item = WishlistItem.builder()
                .customerId(c.getId())
                .product(p)
                .build();
        WishlistItem saved = wishlistItemRepository.save(item);
        return ApiResponse.ok("Product added to wishlist.", wishlistItemToMap(saved), null);
    }

    public ApiResponse removeFromWishlist(String token, Long wishlistItemId) {
        Customer c = getCustomerFromToken(token);
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wishlist item not found."));

        if (!item.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        wishlistItemRepository.delete(item);
        return ApiResponse.ok("Item removed from wishlist.", null, null);
    }

    // ── ORDER & CHECKOUT ENDPOINTS ────────────────────────────────────────
    @Transactional
    public ApiResponse placeOrder(String token, PlaceOrderDTO dto) {
        Customer c = getCustomerFromToken(token);
        
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(c.getId());
        if (cartItems.isEmpty()) {
            return ApiResponse.error("Your cart is empty. Cannot place an order.");
        }

        Address addr = addressRepository.findById(dto.getAddressId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery address not found."));

        if (!addr.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        // Validate stock and compute totals
        double totalAmount = 0.0;
        List<Map<String, Object>> snapshotItems = new ArrayList<>();
        
        for (CartItem item : cartItems) {
            Product p = item.getProduct();
            if (!p.getIsActive()) {
                return ApiResponse.error("Product '" + p.getName() + "' is no longer active.");
            }
            if (p.getStock() < item.getQuantity()) {
                return ApiResponse.error("Insufficient stock for product '" + p.getName() + "'. Only " + p.getStock() + " left.");
            }

            double finalPrice = p.getPrice() - (p.getPrice() * p.getDiscountPercent() / 100.0);
            double lineTotal = finalPrice * item.getQuantity();
            totalAmount += lineTotal;

            // Build snapshot map
            Map<String, Object> itemSnap = new HashMap<>();
            itemSnap.put("productId", p.getId().toString());
            itemSnap.put("name", p.getName());
            itemSnap.put("price", p.getPrice());
            itemSnap.put("discountPercent", p.getDiscountPercent());
            itemSnap.put("finalPrice", finalPrice);
            itemSnap.put("quantity", item.getQuantity());
            itemSnap.put("sellerId", p.getSellerId().toString());
            itemSnap.put("sellerName", p.getSellerName());
            itemSnap.put("image", p.getImagePath() != null ? "/api/files/" + p.getImagePath() : null);
            snapshotItems.add(itemSnap);

            // Deduct stock
            p.setStock(p.getStock() - item.getQuantity());
            productRepository.save(p);
        }

        // Build address snapshot
        String addressSnapStr;
        String itemsSnapStr;
        try {
            addressSnapStr = objectMapper.writeValueAsString(addressToMap(addr));
            itemsSnapStr = objectMapper.writeValueAsString(snapshotItems);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize order details.");
        }

        // Handle payment method
        boolean isCod = "COD".equalsIgnoreCase(dto.getPaymentMethod());

        if (isCod) {
            Order order = Order.builder()
                    .customerId(c.getId())
                    .addressId(addr.getId())
                    .addressSnapshot(addressSnapStr)
                    .itemsJson(itemsSnapStr)
                    .totalAmount(totalAmount)
                    .status("PLACED")
                    .paymentMethod("COD")
                    .paymentStatus("PENDING")
                    .build();

            Order savedOrder = orderRepository.save(order);

            // Clear cart immediately for COD
            cartItemRepository.deleteAll(cartItems);

            return ApiResponse.ok("Order placed successfully via Cash on Delivery.", orderToMap(savedOrder), null);
        } else {
            // Online Payment via Razorpay
            try {
                if (razorpayKeyId == null || razorpayKeyId.contains("mock") || razorpayKeySecret == null || razorpayKeySecret.contains("mock")) {
                    String razorpayOrderId = "order_mock_" + System.currentTimeMillis();

                    Order order = Order.builder()
                            .customerId(c.getId())
                            .addressId(addr.getId())
                            .addressSnapshot(addressSnapStr)
                            .itemsJson(itemsSnapStr)
                            .totalAmount(totalAmount)
                            .status("PENDING_PAYMENT")
                            .paymentMethod(dto.getPaymentMethod().toUpperCase())
                            .paymentStatus("PENDING")
                            .razorpayOrderId(razorpayOrderId)
                            .build();

                    Order savedOrder = orderRepository.save(order);

                    Map<String, Object> responseData = orderToMap(savedOrder);
                    responseData.put("razorpayOrderId", razorpayOrderId);
                    responseData.put("razorpayKeyId", razorpayKeyId);
                    responseData.put("amount", Math.round(totalAmount * 100));
                    responseData.put("currency", "INR");

                    return ApiResponse.ok("Razorpay order created successfully (SIMULATED).", responseData, null);
                }

                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderRequest = new JSONObject();
                long amountInPaise = Math.round(totalAmount * 100);
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

                com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
                String razorpayOrderId = razorpayOrder.get("id");

                Order order = Order.builder()
                        .customerId(c.getId())
                        .addressId(addr.getId())
                        .addressSnapshot(addressSnapStr)
                        .itemsJson(itemsSnapStr)
                        .totalAmount(totalAmount)
                        .status("PENDING_PAYMENT")
                        .paymentMethod(dto.getPaymentMethod().toUpperCase())
                        .paymentStatus("PENDING")
                        .razorpayOrderId(razorpayOrderId)
                        .build();

                Order savedOrder = orderRepository.save(order);

                // Note: Do NOT clear the cart items yet. They will be cleared upon successful verification.

                Map<String, Object> responseData = orderToMap(savedOrder);
                responseData.put("razorpayOrderId", razorpayOrderId);
                responseData.put("razorpayKeyId", razorpayKeyId);
                responseData.put("amount", amountInPaise);
                responseData.put("currency", "INR");

                return ApiResponse.ok("Razorpay order created successfully.", responseData, null);
            } catch (RazorpayException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create Razorpay order: " + e.getMessage());
            }
        }
    }

    public ApiResponse getMyOrders(String token) {
        Customer c = getCustomerFromToken(token);
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(c.getId());
        List<Map<String, Object>> list = orders.stream()
                .map(this::orderToMap)
                .collect(Collectors.toList());
        return ApiResponse.ok("Orders fetched successfully.", list, null);
    }

    public ApiResponse getOrderDetail(String token, Long orderId) {
        Customer c = getCustomerFromToken(token);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        return ApiResponse.ok("Order details fetched.", orderToMap(order), null);
    }

    @Transactional
    public ApiResponse cancelOrder(String token, Long orderId) {
        Customer c = getCustomerFromToken(token);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        if (!"PLACED".equalsIgnoreCase(order.getStatus())) {
            return ApiResponse.error("Order cannot be cancelled. Current status is: " + order.getStatus());
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        // Revert product stock
        try {
            List<Map<String, Object>> items = objectMapper.readValue(order.getItemsJson(), new TypeReference<List<Map<String, Object>>>() {});
            for (Map<String, Object> item : items) {
                Long productId = Long.parseLong(item.get("productId").toString());
                int quantity = Integer.parseInt(item.get("quantity").toString());
                productRepository.findById(productId).ifPresent(p -> {
                    p.setStock(p.getStock() + quantity);
                    productRepository.save(p);
                });
            }
        } catch (Exception e) {
            // Log warning but don't fail transaction
            System.err.println("Warning: failed to restore stock for cancelled order " + orderId + ": " + e.getMessage());
        }

        return ApiResponse.ok("Order cancelled successfully.", orderToMap(order), null);
    }

    // ── PRIVATE MAPPING HELPERS ───────────────────────────────────────────
    private Map<String, Object> safeCustomer(Customer c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("fullName", c.getFullName());
        m.put("email", c.getEmail());
        m.put("phone", c.getPhone());
        m.put("profilePic", c.getProfilePic() != null ? "/api/files/" + c.getProfilePic() : null);
        m.put("dateOfBirth", c.getDateOfBirth());
        m.put("gender", c.getGender());
        m.put("createdAt", c.getCreatedAt());
        m.put("updatedAt", c.getUpdatedAt());
        return m;
    }

    private Map<String, Object> addressToMap(Address addr) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", addr.getId());
        m.put("customerId", addr.getCustomerId());
        m.put("label", addr.getLabel());
        m.put("fullName", addr.getFullName());
        m.put("phone", addr.getPhone());
        m.put("line1", addr.getLine1());
        m.put("line2", addr.getLine2());
        m.put("city", addr.getCity());
        m.put("state", addr.getState());
        m.put("pincode", addr.getPincode());
        m.put("isDefault", addr.getIsDefault());
        return m;
    }

    private Map<String, Object> cartItemToMap(CartItem item) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", item.getId());
        m.put("customerId", item.getCustomerId());
        m.put("quantity", item.getQuantity());
        m.put("addedAt", item.getAddedAt() != null ? item.getAddedAt().toString() : null);

        Product p = item.getProduct();
        Map<String, Object> prod = new HashMap<>();
        prod.put("id", p.getId().toString());
        prod.put("name", p.getName());
        prod.put("price", p.getPrice());
        prod.put("discountPercent", p.getDiscountPercent());
        double finalPrice = p.getPrice() - (p.getPrice() * p.getDiscountPercent() / 100.0);
        prod.put("finalPrice", finalPrice);
        prod.put("image", p.getImagePath() != null ? "/api/files/" + p.getImagePath() : null);
        prod.put("sellerId", p.getSellerId().toString());
        prod.put("sellerName", p.getSellerName());
        prod.put("stock", p.getStock());

        m.put("product", prod);
        return m;
    }

    private Map<String, Object> wishlistItemToMap(WishlistItem item) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", item.getId());
        m.put("customerId", item.getCustomerId());
        m.put("addedAt", item.getAddedAt() != null ? item.getAddedAt().toString() : null);

        Product p = item.getProduct();
        Map<String, Object> prod = new HashMap<>();
        prod.put("id", p.getId().toString());
        prod.put("name", p.getName());
        prod.put("price", p.getPrice());
        prod.put("discountPercent", p.getDiscountPercent());
        double finalPrice = p.getPrice() - (p.getPrice() * p.getDiscountPercent() / 100.0);
        prod.put("finalPrice", finalPrice);
        prod.put("image", p.getImagePath() != null ? "/api/files/" + p.getImagePath() : null);
        prod.put("sellerId", p.getSellerId().toString());
        prod.put("sellerName", p.getSellerName());
        prod.put("stock", p.getStock());

        m.put("product", prod);
        return m;
    }

    @Transactional
    public ApiResponse verifyPayment(String token, VerifyPaymentDTO dto) {
        Customer c = getCustomerFromToken(token);

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getCustomerId().equals(c.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        // Verify signature
        boolean isValid = verifyRazorpaySignature(
                dto.getRazorpayOrderId(),
                dto.getRazorpayPaymentId(),
                dto.getRazorpaySignature()
        );

        if (!isValid) {
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
            return ApiResponse.error("Payment signature verification failed.");
        }

        // Signature verified, update order status and clear customer cart
        order.setPaymentStatus("PAID");
        order.setStatus("PLACED");
        order.setRazorpayPaymentId(dto.getRazorpayPaymentId());
        order.setRazorpaySignature(dto.getRazorpaySignature());
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteByCustomerId(c.getId());

        return ApiResponse.ok("Payment verified and order placed successfully.", orderToMap(savedOrder), null);
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        if (orderId != null && orderId.startsWith("order_mock_")) {
            return true;
        }
        if (razorpayKeyId != null && razorpayKeyId.contains("mock")) {
            return true;
        }
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    private Map<String, Object> orderToMap(Order order) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", order.getId());
        m.put("customerId", order.getCustomerId());
        m.put("addressId", order.getAddressId());

        try {
            if (order.getAddressSnapshot() != null) {
                m.put("address", objectMapper.readValue(order.getAddressSnapshot(), Map.class));
            } else {
                m.put("address", null);
            }
        } catch (Exception e) {
            m.put("address", order.getAddressSnapshot());
        }

        try {
            if (order.getItemsJson() != null) {
                m.put("items", objectMapper.readValue(order.getItemsJson(), List.class));
            } else {
                m.put("items", new ArrayList<>());
            }
        } catch (Exception e) {
            m.put("items", new ArrayList<>());
        }

        m.put("totalAmount", order.getTotalAmount());
        m.put("status", order.getStatus());
        m.put("paymentMethod", order.getPaymentMethod());
        m.put("paymentStatus", order.getPaymentStatus());
        m.put("razorpayOrderId", order.getRazorpayOrderId());
        m.put("razorpayPaymentId", order.getRazorpayPaymentId());
        m.put("razorpaySignature", order.getRazorpaySignature());
        m.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
        m.put("updatedAt", order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null);
        return m;
    }
}
