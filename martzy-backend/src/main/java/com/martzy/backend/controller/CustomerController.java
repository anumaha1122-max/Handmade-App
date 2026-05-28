package com.martzy.backend.controller;

import com.martzy.backend.dto.AddressDTO;
import com.martzy.backend.dto.CartItemDTO;
import com.martzy.backend.dto.PlaceOrderDTO;
import com.martzy.backend.dto.UpdateProfileDTO;
import com.martzy.backend.dto.VerifyPaymentDTO;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.CustomerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerProfileService customerProfileService;

    // ── Profile ───────────────────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = customerProfileService.getProfile(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UpdateProfileDTO dto
    ) {
        try {
            ApiResponse response = customerProfileService.updateProfile(token, dto);
            int status = response.isSuccess() ? 200 : 400;
            return ResponseEntity.status(status).body(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Saved Addresses ───────────────────────────────────────────────────
    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse> getAddresses(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = customerProfileService.getAddresses(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse> addAddress(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody AddressDTO dto
    ) {
        try {
            ApiResponse response = customerProfileService.addAddress(token, dto);
            int status = response.isSuccess() ? 201 : 400;
            return ResponseEntity.status(status).body(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse> updateAddress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @Valid @RequestBody AddressDTO dto
    ) {
        try {
            ApiResponse response = customerProfileService.updateAddress(token, id, dto);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse> deleteAddress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        try {
            ApiResponse response = customerProfileService.deleteAddress(token, id);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Cart ──────────────────────────────────────────────────────────────
    @GetMapping("/cart")
    public ResponseEntity<ApiResponse> getCart(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = customerProfileService.getCart(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PostMapping("/cart")
    public ResponseEntity<ApiResponse> addToCart(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CartItemDTO dto
    ) {
        try {
            ApiResponse response = customerProfileService.addToCart(token, dto);
            int status = response.isSuccess() ? 201 : 400;
            return ResponseEntity.status(status).body(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PutMapping("/cart/{id}")
    public ResponseEntity<ApiResponse> updateCartQuantity(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam("quantity") Integer quantity
    ) {
        try {
            ApiResponse response = customerProfileService.updateCartQuantity(token, id, quantity);
            int status = response.isSuccess() ? 200 : 400;
            return ResponseEntity.status(status).body(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @DeleteMapping("/cart/{id}")
    public ResponseEntity<ApiResponse> removeFromCart(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        try {
            ApiResponse response = customerProfileService.removeFromCart(token, id);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @DeleteMapping("/cart")
    public ResponseEntity<ApiResponse> clearCart(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = customerProfileService.clearCart(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Wishlist ──────────────────────────────────────────────────────────
    @GetMapping("/wishlist")
    public ResponseEntity<ApiResponse> getWishlist(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = customerProfileService.getWishlist(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PostMapping("/wishlist")
    public ResponseEntity<ApiResponse> addToWishlist(
            @RequestHeader("Authorization") String token,
            @RequestParam("productId") Long productId
    ) {
        try {
            ApiResponse response = customerProfileService.addToWishlist(token, productId);
            int status = response.isSuccess() ? 201 : 400;
            return ResponseEntity.status(status).body(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @DeleteMapping("/wishlist/{id}")
    public ResponseEntity<ApiResponse> removeFromWishlist(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        try {
            ApiResponse response = customerProfileService.removeFromWishlist(token, id);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Orders ────────────────────────────────────────────────────────────
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse> placeOrder(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody PlaceOrderDTO dto
    ) {
        try {
            ApiResponse response = customerProfileService.placeOrder(token, dto);
            int status = response.isSuccess() ? 201 : 400;
            return ResponseEntity.status(status).body(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PostMapping("/orders/verify-payment")
    public ResponseEntity<ApiResponse> verifyPayment(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody VerifyPaymentDTO dto
    ) {
        try {
            ApiResponse response = customerProfileService.verifyPayment(token, dto);
            int status = response.isSuccess() ? 200 : 400;
            return ResponseEntity.status(status).body(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse> getMyOrders(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = customerProfileService.getMyOrders(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse> getOrderDetail(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        try {
            ApiResponse response = customerProfileService.getOrderDetail(token, id);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        try {
            ApiResponse response = customerProfileService.cancelOrder(token, id);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}
