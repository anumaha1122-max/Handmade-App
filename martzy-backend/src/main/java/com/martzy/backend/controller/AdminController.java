// ─── src/main/java/com/martzy/backend/controller/AdminController.java ─────────
package com.martzy.backend.controller;

import com.martzy.backend.dto.AdminLoginDTO;
import com.martzy.backend.dto.AdminResetPasswordDTO;
import com.martzy.backend.service.AdminService;
import jakarta.validation.Valid;
import com.martzy.backend.model.Seller;
import com.martzy.backend.repository.SellerRepository;
import com.martzy.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class AdminController {

    private final SellerRepository sellerRepository;
    private final AdminService adminService;

    // ── POST /api/admin/login ─────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody AdminLoginDTO dto) {
        ApiResponse response = adminService.login(dto);
        int status = response.isSuccess() ? 200 : 401;
        return ResponseEntity.status(status).body(response);
    }

    // ── POST /api/admin/forgot-password ───────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.status(400).body(ApiResponse.error("Email is required."));
        }
        ApiResponse response = adminService.forgotPassword(email);
        int status = response.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(response);
    }

    // ── POST /api/admin/reset-password ────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody AdminResetPasswordDTO dto) {
        ApiResponse response = adminService.resetPassword(dto.getEmail(), dto.getToken(), dto.getNewPassword());
        int status = response.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(response);
    }

    // ── GET /api/admin/sellers/pending ────────────────────────────────────────
    // Returns all sellers waiting for approval
    @GetMapping("/sellers/pending")
    public ResponseEntity<ApiResponse> getPendingSellers() {
        List<Seller> pendingSellers = sellerRepository
                .findByApprovalStatus(Seller.ApprovalStatus.PENDING);

        List<Map<String, Object>> result = pendingSellers.stream()
                .map(this::safeSellerInfo)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.ok("Pending sellers fetched.", result, null)
        );
    }

    // ── GET /api/admin/sellers/all ────────────────────────────────────────────
    // Returns all sellers (any status) — for admin dashboard overview
    @GetMapping("/sellers/all")
    public ResponseEntity<ApiResponse> getAllSellers() {
        List<Seller> all = sellerRepository.findAll();

        List<Map<String, Object>> result = all.stream()
                .map(this::safeSellerInfo)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.ok("All sellers fetched.", result, null)
        );
    }

    // ── GET /api/admin/sellers/{id} ───────────────────────────────────────────
    // Returns full details of one seller (for admin review screen)
    @GetMapping("/sellers/{id}")
    public ResponseEntity<ApiResponse> getSellerById(@PathVariable Long id) {
        Optional<Seller> opt = sellerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("Seller not found."));
        }
        return ResponseEntity.ok(
                ApiResponse.ok("Seller fetched.", safeSellerInfo(opt.get()), null)
        );
    }

    // ── POST /api/admin/sellers/{id}/approve ──────────────────────────────────
    // Admin approves a pending seller — seller can now login
    @PostMapping("/sellers/{id}/approve")
    public ResponseEntity<ApiResponse> approveSeller(@PathVariable Long id) {
        Optional<Seller> opt = sellerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("Seller not found."));
        }

        Seller seller = opt.get();
        seller.setApprovalStatus(Seller.ApprovalStatus.APPROVED);
        seller.setRejectionReason(null);
        sellerRepository.save(seller);

        return ResponseEntity.ok(
                ApiResponse.ok(
                        seller.getFullName() + " has been approved. They can now log in.",
                        safeSellerInfo(seller),
                        null
                )
        );
    }

    // ── POST /api/admin/sellers/{id}/reject ───────────────────────────────────
    // Admin rejects a seller with an optional reason
    @PostMapping("/sellers/{id}/reject")
    public ResponseEntity<ApiResponse> rejectSeller(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        Optional<Seller> opt = sellerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("Seller not found."));
        }

        String reason = (body != null && body.containsKey("reason") && !body.get("reason").isBlank())
                ? body.get("reason")
                : "Does not meet seller requirements.";

        Seller seller = opt.get();
        seller.setApprovalStatus(Seller.ApprovalStatus.REJECTED);
        seller.setRejectionReason(reason);
        sellerRepository.save(seller);

        return ResponseEntity.ok(
                ApiResponse.ok(
                        seller.getFullName() + " has been rejected.",
                        safeSellerInfo(seller),
                        null
                )
        );
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private Map<String, Object> safeSellerInfo(Seller s) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", s.getId());
        map.put("fullName", s.getFullName());
        map.put("email", s.getEmail());
        map.put("phone", s.getPhone());
        map.put("shopName", s.getShopName());
        map.put("businessType", s.getBusinessType());
        map.put("gstin", s.getGstin());
        map.put("description", s.getDescription());
        map.put("address", s.getAddress());
        map.put("address2", s.getAddress2());
        map.put("city", s.getCity());
        map.put("state", s.getState());
        map.put("pinCode", s.getPinCode());
        map.put("approvalStatus", s.getApprovalStatus());
        map.put("rejectionReason", s.getRejectionReason());
        map.put("aadharDocPath", s.getAadharDocPath());
        map.put("panDocPath", s.getPanDocPath());
        map.put("businessProofPath", s.getBusinessProofPath());
        map.put("bankDetailsPath", s.getBankDetailsPath());
        map.put("createdAt", s.getCreatedAt());
        return map;
    }
}