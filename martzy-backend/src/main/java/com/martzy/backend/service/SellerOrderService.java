package com.martzy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.martzy.backend.model.Order;

import com.martzy.backend.repository.OrderRepository;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import lombok.NonNull;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SellerOrderService {

    private final OrderRepository orderRepository;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Get Seller Orders ─────────────────────────────────────────────────
    public ApiResponse getSellerOrders(String token) {
        Long sellerId = extractSellerId(token);
        
        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> sellerOrders = new ArrayList<>();

        for (Order order : allOrders) {
            try {
                List<Map<String, Object>> items = objectMapper.readValue(
                        order.getItemsJson(), 
                        new TypeReference<List<Map<String, Object>>>() {}
                );

                List<Map<String, Object>> sellerItems = new ArrayList<>();
                double sellerTotal = 0.0;

                for (Map<String, Object> item : items) {
                    if (item.get("sellerId") != null && item.get("sellerId").toString().equals(sellerId.toString())) {
                        sellerItems.add(item);
                        // Calculate total for this seller
                        Object qtyObj = item.get("quantity");
                        Object priceObj = item.get("finalPrice");
                        if (qtyObj != null && priceObj != null) {
                            int qty = Integer.parseInt(qtyObj.toString());
                            double price = Double.parseDouble(priceObj.toString());
                            sellerTotal += (qty * price);
                        }
                    }
                }

                if (!sellerItems.isEmpty()) {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", order.getId().toString());
                    orderMap.put("customerId", order.getCustomerId().toString());
                    orderMap.put("status", order.getStatus());
                    orderMap.put("paymentMethod", order.getPaymentMethod());
                    orderMap.put("paymentStatus", order.getPaymentStatus());
                    orderMap.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
                    orderMap.put("updatedAt", order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null);
                    
                    // Add only this seller's items and total
                    orderMap.put("items", sellerItems);
                    orderMap.put("totalAmount", sellerTotal);

                    // Parse address if needed by frontend
                    if (order.getAddressSnapshot() != null) {
                        Map<String, Object> addr = objectMapper.readValue(
                                order.getAddressSnapshot(), 
                                new TypeReference<Map<String, Object>>() {}
                        );
                        orderMap.put("address", addr);
                    }

                    sellerOrders.add(orderMap);
                }

            } catch (Exception e) {
                // Ignore parse errors for individual orders
            }
        }

        return ApiResponse.ok("Seller orders fetched successfully.", sellerOrders, null);
    }

    // ── Update Order Status ───────────────────────────────────────────────
    
public ApiResponse updateOrderStatus(String token, @NonNull Long orderId, String status) {
        Long sellerId = extractSellerId(token);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        // Verify the order actually contains items for this seller before allowing status update
        boolean hasSellerItems = false;
        try {
            List<Map<String, Object>> items = objectMapper.readValue(
                    order.getItemsJson(), 
                    new TypeReference<List<Map<String, Object>>>() {}
            );
            for (Map<String, Object> item : items) {
                if (item.get("sellerId") != null && item.get("sellerId").toString().equals(sellerId.toString())) {
                    hasSellerItems = true;
                    break;
                }
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse order items.");
        }

        if (!hasSellerItems) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This order does not belong to your shop.");
        }

        order.setStatus(status.toUpperCase());
        orderRepository.save(order);

        return ApiResponse.ok("Order status updated to " + status + ".", null, null);
    }

    // ── Private Helpers ───────────────────────────────────────────────────
    private Long extractSellerId(String bearerToken) {
        String token = bearerToken.replace("Bearer ", "").trim();
        String subject = jwtUtil.extractSubject(token);
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token.");
        }
    }
}
