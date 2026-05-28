// // ─── src/main/java/com/martzy/backend/controller/SellerAuthController.java ──
// package com.martzy.backend.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.martzy.backend.dto.LoginDTO;
// import com.martzy.backend.response.ApiResponse;
// import com.martzy.backend.service.SellerService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.multipart.MultipartFile;
// import org.springframework.web.server.ResponseStatusException;

// @RestController
// @RequestMapping("/api/seller")
// @RequiredArgsConstructor
// @CrossOrigin(origins = "*")
// public class SellerAuthController {

//     private final SellerService sellerService;

//     // ── POST /api/seller/register  (multipart/form-data) ──────────────────
//     @PostMapping("/register")
//     public ResponseEntity<ApiResponse> register(
//             @RequestParam("fullName")      String fullName,
//             @RequestParam("email")         String email,
//             @RequestParam("phone")         String phone,
//             @RequestParam("password")      String password,
//             @RequestParam("shopName")      String shopName,
//             @RequestParam("businessType")  String businessType,
//             @RequestParam(value = "gstin", required = false, defaultValue = "") String gstin,
//             @RequestParam(value = "description", required = false, defaultValue = "") String description,
//             @RequestParam("address")       String address,
//             @RequestParam(value = "address2", required = false, defaultValue = "") String address2,
//             @RequestParam("city")          String city,
//             @RequestParam("state")         String state,
//             @RequestParam("pinCode")       String pinCode,
//             @RequestParam("aadharDoc")     MultipartFile aadharDoc,
//             @RequestParam("panDoc")        MultipartFile panDoc,
//             @RequestParam("businessProof") MultipartFile businessProof,
//             @RequestParam("bankDetails")   MultipartFile bankDetails
//     ) {
//         ApiResponse response = sellerService.register(
//                 fullName, email, phone, password,
//                 shopName, businessType, gstin, description,
//                 address, address2, city, state, pinCode,
//                 aadharDoc, panDoc, businessProof, bankDetails
//         );

//         int status = response.isSuccess() ? 201 : 400;
//         return ResponseEntity.status(status).body(response);
//     }

//     // ── POST /api/seller/login  (JSON) ────────────────────────────────────
//     @PostMapping("/login")
//     public ResponseEntity<ApiResponse> login(
//             @Valid @RequestBody LoginDTO dto
//     ) {
//         try {
//             ApiResponse response = sellerService.login(dto);
//             return ResponseEntity.ok(response);

//         } catch (ResponseStatusException ex) {
//             String rawMessage = ex.getReason() != null ? ex.getReason() : ex.getMessage();
//             int httpStatus = ex.getStatusCode().value();

//             // ── Parse PENDING / REJECTED status from message ──────────────
//             if (rawMessage != null && rawMessage.contains("||")) {
//                 String[] parts = rawMessage.split("\\|\\|", 2);
//                 String approvalStatus = parts[0];   // "PENDING" or "REJECTED"
//                 String message = parts[1];
//                 ApiResponse errorResp = ApiResponse.error(message, approvalStatus);
//                 return ResponseEntity.status(httpStatus).body(errorResp);
//             }

//             return ResponseEntity.status(httpStatus)
//                     .body(ApiResponse.error(rawMessage));
//         }
//     }
// }  


























// ─── src/main/java/com/martzy/backend/controller/SellerAuthController.java ──
package com.martzy.backend.controller;

import com.martzy.backend.dto.LoginDTO;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.SellerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerAuthController {

    private final SellerService sellerService;

    // ── POST /api/seller/register  (multipart/form-data) ──────────────────
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(
            @RequestParam("fullName")      String fullName,
            @RequestParam("email")         String email,
            @RequestParam("phone")         String phone,
            @RequestParam("password")      String password,
            @RequestParam("shopName")      String shopName,
            @RequestParam("businessType")  String businessType,
            @RequestParam(value = "gstin", required = false, defaultValue = "") String gstin,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("address")       String address,
            @RequestParam(value = "address2", required = false, defaultValue = "") String address2,
            @RequestParam("city")          String city,
            @RequestParam("state")         String state,
            @RequestParam("pinCode")       String pinCode,
            // ✅ Direct @RequestParam per file — reliable name-based binding, no iterator
            @RequestParam(value = "aadharDoc",     required = false) MultipartFile aadharDoc,
            @RequestParam(value = "panDoc",        required = false) MultipartFile panDoc,
            @RequestParam(value = "businessProof", required = false) MultipartFile businessProof,
            @RequestParam(value = "bankDetails",   required = false) MultipartFile bankDetails
    ) {
        ApiResponse response = sellerService.register(
                fullName, email, phone, password,
                shopName, businessType, gstin, description,
                address, address2, city, state, pinCode,
                aadharDoc, panDoc, businessProof, bankDetails
        );

        int status = response.isSuccess() ? 201 : 400;
        return ResponseEntity.status(status).body(response);
    }

    // ── POST /api/seller/login  (JSON) ────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            @Valid @RequestBody LoginDTO dto
    ) {
        try {
            ApiResponse response = sellerService.login(dto);
            return ResponseEntity.ok(response);

        } catch (ResponseStatusException ex) {
            String rawMessage = ex.getReason() != null ? ex.getReason() : ex.getMessage();
            int httpStatus = ex.getStatusCode().value();

            if (rawMessage != null && rawMessage.contains("||")) {
                String[] parts = rawMessage.split("\\|\\|", 2);
                String approvalStatus = parts[0];
                String message = parts[1];
                ApiResponse errorResp = ApiResponse.error(message, approvalStatus);
                return ResponseEntity.status(httpStatus).body(errorResp);
            }

            return ResponseEntity.status(httpStatus)
                    .body(ApiResponse.error(rawMessage));
        }
    }

    // ── GET /api/seller/profile ───────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = sellerService.getProfile(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── PUT /api/seller/profile ───────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "shopName", required = false) String shopName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "address", required = false) String address
    ) {
        try {
            ApiResponse response = sellerService.updateProfile(token, fullName, shopName, phone, address);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}