package com.martzy.backend.controller;

import com.martzy.backend.dto.ReturnRequestDTO;
import com.martzy.backend.dto.ReturnRespondDTO;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReturnController {

    private final ReturnService returnService;

    // ── Customer: Request a return ────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse> requestReturn(
            @RequestHeader("Authorization") String token,
            @RequestBody ReturnRequestDTO dto
    ) {
        try {
            ApiResponse res = returnService.requestReturn(token, dto);
            return ResponseEntity.status(res.isSuccess() ? 201 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Customer: List my returns ─────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<ApiResponse> getMyReturns(
            @RequestHeader("Authorization") String token
    ) {
        try {
            return ResponseEntity.ok(returnService.getMyReturns(token));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Seller: List returns for shop ─────────────────────────────────────
    @GetMapping("/seller")
    public ResponseEntity<ApiResponse> getSellerReturns(
            @RequestHeader("Authorization") String token
    ) {
        try {
            return ResponseEntity.ok(returnService.getSellerReturns(token));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Customer / Seller: Get single return detail ────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getReturn(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(returnService.getReturn(id));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Seller: Approve or Reject ─────────────────────────────────────────
    @PatchMapping("/{id}/respond")
    public ResponseEntity<ApiResponse> respond(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody ReturnRespondDTO dto
    ) {
        try {
            ApiResponse res = returnService.respondToReturn(token, id, dto);
            return ResponseEntity.status(res.isSuccess() ? 200 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Seller: Advance status (PICKED_UP / REFUND_INITIATED / REFUNDED) ──
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse> advanceStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam String status
    ) {
        try {
            ApiResponse res = returnService.advanceReturnStatus(token, id, status);
            return ResponseEntity.status(res.isSuccess() ? 200 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}
