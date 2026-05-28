package com.martzy.backend.service;

import com.martzy.backend.dto.ReviewDTO;
import com.martzy.backend.model.Customer;
import com.martzy.backend.model.Order;
import com.martzy.backend.model.Review;
import com.martzy.backend.model.Seller;
import com.martzy.backend.repository.CustomerRepository;
import com.martzy.backend.repository.OrderRepository;
import com.martzy.backend.repository.ReviewRepository;
import com.martzy.backend.repository.SellerRepository;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Helper ─────────────────────────────────────────────────────────────
    private Long extractId(String bearerToken) {
        String token = bearerToken.replace("Bearer ", "").trim();
        String subject = jwtUtil.extractSubject(token);
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            Optional<Long> customerId = customerRepository.findByEmail(subject).map(Customer::getId);
            if (customerId.isPresent()) {
                return customerId.get();
            }
            return sellerRepository.findByEmail(subject)
                    .map(Seller::getId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token."));
        }
    }

    private Long resolveSellerIdFromOrder(Order order, Long productId) {
        try {
            List<Map<String, Object>> items = objectMapper.readValue(
                    order.getItemsJson(), new TypeReference<List<Map<String, Object>>>() {});
            for (Map<String, Object> item : items) {
                if (item.get("id") != null && item.get("id").toString().equals(productId.toString())) {
                    if (item.get("sellerId") != null) {
                        return Long.parseLong(item.get("sellerId").toString());
                    }
                }
            }
        } catch (Exception ignored) {}
        return 0L;
    }

    // ── Customer: Submit a Review ──────────────────────────────────────────
    public ApiResponse submitReview(String token, ReviewDTO dto) {
        Long customerId = extractId(token);

        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            return ApiResponse.error("Rating must be between 1 and 5.");
        }

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getCustomerId().equals(customerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This order does not belong to you.");
        }

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            return ApiResponse.error("You can only review a product after the order is delivered.");
        }

        if (reviewRepository.existsByOrderIdAndProductId(dto.getOrderId(), dto.getProductId())) {
            return ApiResponse.error("You have already reviewed this product for this order.");
        }

        Long sellerId = resolveSellerIdFromOrder(order, dto.getProductId());

        Review review = Review.builder()
                .orderId(dto.getOrderId())
                .productId(dto.getProductId())
                .customerId(customerId)
                .sellerId(sellerId)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        return ApiResponse.ok("Review submitted. Thank you!", saved, null);
    }

    // ── Public: Reviews for a Product ─────────────────────────────────────
    public ApiResponse getProductReviews(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        Double avgRating = reviewRepository.averageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);

        Map<String, Object> result = new HashMap<>();
        result.put("reviews", reviews);
        result.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
        result.put("totalReviews", count);

        return ApiResponse.ok("Reviews fetched.", result, null);
    }

    // ── Customer: My Reviews ───────────────────────────────────────────────
    public ApiResponse getMyReviews(String token) {
        Long customerId = extractId(token);
        List<Review> reviews = reviewRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return ApiResponse.ok("Your reviews fetched.", reviews, null);
    }

    // ── Seller: All Reviews for Their Products ─────────────────────────────
    public ApiResponse getSellerReviews(String token) {
        Long sellerId = extractId(token);
        List<Review> reviews = reviewRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        return ApiResponse.ok("Seller reviews fetched.", reviews, null);
    }
}
