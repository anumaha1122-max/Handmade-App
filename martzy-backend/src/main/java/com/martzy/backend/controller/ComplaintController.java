package com.martzy.backend.controller;

import com.martzy.backend.dto.ComplaintDTO;
import com.martzy.backend.dto.ComplaintRespondDTO;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;

    // ── Customer: Raise a complaint ───────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse> raise(
            @RequestHeader("Authorization") String token,
            @RequestBody ComplaintDTO dto
    ) {
        try {
            ApiResponse res = complaintService.raiseComplaint(token, dto);
            return ResponseEntity.status(res.isSuccess() ? 201 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Customer: My complaints ───────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<ApiResponse> myComplaints(
            @RequestHeader("Authorization") String token
    ) {
        try {
            return ResponseEntity.ok(complaintService.getMyComplaints(token));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Seller: Complaints against shop ──────────────────────────────────
    @GetMapping("/seller")
    public ResponseEntity<ApiResponse> sellerComplaints(
            @RequestHeader("Authorization") String token
    ) {
        try {
            return ResponseEntity.ok(complaintService.getSellerComplaints(token));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Seller: Respond to a complaint ────────────────────────────────────
    @PatchMapping("/{id}/respond")
    public ResponseEntity<ApiResponse> sellerRespond(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody ComplaintRespondDTO dto
    ) {
        try {
            ApiResponse res = complaintService.sellerRespond(token, id, dto);
            return ResponseEntity.status(res.isSuccess() ? 200 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── Admin: All complaints ─────────────────────────────────────────────
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse> allComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    // ── Admin: Resolve or close ───────────────────────────────────────────
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse> adminResolve(
            @PathVariable Long id,
            @RequestBody ComplaintRespondDTO dto
    ) {
        try {
            ApiResponse res = complaintService.adminResolve(id, dto);
            return ResponseEntity.status(res.isSuccess() ? 200 : 400).body(res);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}
