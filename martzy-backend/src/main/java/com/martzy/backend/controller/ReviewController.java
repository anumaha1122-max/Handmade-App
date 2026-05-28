package com.martzy.backend.controller;

import com.martzy.backend.dto.ReviewDTO;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    // ── Customer: Submit a review ─────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse> submit(
            @RequestHeader("Authorization") String token,
            @RequestBody ReviewDTO dto
    ) {
        try {
            ApiResponse res = reviewService.submitReview(token, dto);
            return ResponseEntity.status(res.isSuccess() ? 201 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Public: Get reviews + rating for a product ────────────────────────
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse> productReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    // ── Customer: My submitted reviews ────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<ApiResponse> myReviews(
            @RequestHeader("Authorization") String token
    ) {
        try {
            return ResponseEntity.ok(reviewService.getMyReviews(token));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Seller: Reviews for their products ───────────────────────────────
    @GetMapping("/seller")
    public ResponseEntity<ApiResponse> sellerReviews(
            @RequestHeader("Authorization") String token
    ) {
        try {
            return ResponseEntity.ok(reviewService.getSellerReviews(token));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}
