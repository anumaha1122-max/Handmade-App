package com.martzy.backend.controller;

import com.martzy.backend.dto.MessageDTO;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    // ── Customer: Send a message ──────────────────────────────────────────
    @PostMapping("/customer")
    public ResponseEntity<ApiResponse> customerSend(
            @RequestHeader("Authorization") String token,
            @RequestBody MessageDTO dto
    ) {
        try {
            ApiResponse res = messageService.customerSend(token, dto);
            return ResponseEntity.status(res.isSuccess() ? 201 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Seller: Send a message ────────────────────────────────────────────
    @PostMapping("/seller")
    public ResponseEntity<ApiResponse> sellerSend(
            @RequestHeader("Authorization") String token,
            @RequestBody MessageDTO dto
    ) {
        try {
            ApiResponse res = messageService.sellerSend(token, dto);
            return ResponseEntity.status(res.isSuccess() ? 201 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Customer: Get full thread for an order ────────────────────────────
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse> customerThread(
            @RequestHeader("Authorization") String token,
            @PathVariable Long orderId
    ) {
        try {
            return ResponseEntity.ok(messageService.customerGetThread(token, orderId));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Seller: Get full thread for an order ─────────────────────────────
    @GetMapping("/seller/order/{orderId}")
    public ResponseEntity<ApiResponse> sellerThread(
            @RequestHeader("Authorization") String token,
            @PathVariable Long orderId
    ) {
        try {
            return ResponseEntity.ok(messageService.sellerGetThread(token, orderId));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Unread count for badge (pass callerType = CUSTOMER or SELLER) ─────
    @GetMapping("/order/{orderId}/unread")
    public ResponseEntity<ApiResponse> unreadCount(
            @RequestHeader("Authorization") String token,
            @PathVariable Long orderId,
            @RequestParam String callerType
    ) {
        try {
            return ResponseEntity.ok(messageService.unreadCount(token, orderId, callerType));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}
