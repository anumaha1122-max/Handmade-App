package com.martzy.backend.controller;

import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.SellerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerOrderController {

    private final SellerOrderService sellerOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse> getSellerOrders(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = sellerOrderService.getSellerOrders(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam("status") String status
    ) {
        try {
            ApiResponse response = sellerOrderService.updateOrderStatus(token, id, status);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}
