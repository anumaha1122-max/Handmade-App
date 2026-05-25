

// // ─── src/main/java/com/martzy/backend/service/SellerService.java ───────────
// package com.martzy.backend.service;

// import com.martzy.backend.dto.LoginDTO;
// import com.martzy.backend.model.Seller;
// import com.martzy.backend.repository.SellerRepository;
// import com.martzy.backend.response.ApiResponse;
// import com.martzy.backend.security.JwtUtil;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.HttpStatus;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;
// import org.springframework.web.multipart.MultipartFile;
// import org.springframework.web.server.ResponseStatusException;

// import java.io.IOException;
// import java.util.HashMap;
// import java.util.Map;
// import java.util.Optional;

// @Slf4j
// @Service
// @RequiredArgsConstructor
// public class SellerService {

//     private final SellerRepository sellerRepository;
//     private final PasswordEncoder passwordEncoder;
//     private final JwtUtil jwtUtil;
//     private final FileStorageService fileStorageService;

//     // ── Register ───────────────────────────────────────────────────────────
//     public ApiResponse register(
//             String fullName, String email, String phone, String password,
//             String shopName, String businessType, String gstin, String description,
//             String address, String address2, String city, String state, String pinCode,
//             MultipartFile aadharDoc, MultipartFile panDoc,
//             MultipartFile businessProof, MultipartFile bankDetails
//     ) {
//         log.info("[SellerService] Register attempt — email={}, phone={}", email, phone);

//         // Log what files we actually received
//         logFileInfo("aadharDoc",     aadharDoc);
//         logFileInfo("panDoc",        panDoc);
//         logFileInfo("businessProof", businessProof);
//         logFileInfo("bankDetails",   bankDetails);

//         // Check duplicates
//         if (sellerRepository.existsByEmail(email.toLowerCase().trim())) {
//             return ApiResponse.error("Email is already registered.");
//         }
//         if (sellerRepository.existsByPhone(phone.trim())) {
//             return ApiResponse.error("Phone number is already registered.");
//         }

//         // Save document files to disk
//         String aadharPath = null, panPath = null, bProofPath = null, bankPath = null;
//         try {
//             aadharPath = fileStorageService.store(aadharDoc,    "sellers/aadhar");
//             panPath    = fileStorageService.store(panDoc,        "sellers/pan");
//             bProofPath = fileStorageService.store(businessProof, "sellers/business_proof");
//             bankPath   = fileStorageService.store(bankDetails,   "sellers/bank_details");

//             log.info("[SellerService] Files stored — aadhar={}, pan={}, bizProof={}, bank={}",
//                     aadharPath, panPath, bProofPath, bankPath);

//         } catch (IOException e) {
//             log.error("[SellerService] File upload failed!", e);
//             return ApiResponse.error("File upload failed: " + e.getMessage() + ". Please try again.");
//         }

//         Seller seller = Seller.builder()
//                 .fullName(fullName)
//                 .email(email.toLowerCase().trim())
//                 .phone(phone.trim())
//                 .password(passwordEncoder.encode(password))
//                 .shopName(shopName)
//                 .businessType(businessType)
//                 .gstin(gstin)
//                 .description(description)
//                 .address(address)
//                 .address2(address2)
//                 .city(city)
//                 .state(state)
//                 .pinCode(pinCode)
//                 .aadharDocPath(aadharPath)
//                 .panDocPath(panPath)
//                 .businessProofPath(bProofPath)
//                 .bankDetailsPath(bankPath)
//                 .approvalStatus(Seller.ApprovalStatus.PENDING)
//                 .build();

//         sellerRepository.save(seller);

//         log.info("[SellerService] Seller saved — id={}, email={}", seller.getId(), seller.getEmail());

//         return ApiResponse.ok(
//                 "Registration submitted. Awaiting admin approval.",
//                 safeSeller(seller),
//                 null
//         );
//     }

//     // ── Login ──────────────────────────────────────────────────────────────
//     public ApiResponse login(LoginDTO dto) {
//         Optional<Seller> optSeller =
//                 sellerRepository.findByEmailOrPhone(dto.getEmailOrPhone().trim());

//         if (optSeller.isEmpty()) {
//             throw new ResponseStatusException(
//                     HttpStatus.NOT_FOUND, "No account found with these credentials."
//             );
//         }

//         Seller seller = optSeller.get();

//         if (!passwordEncoder.matches(dto.getPassword(), seller.getPassword())) {
//             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password.");
//         }

//         switch (seller.getApprovalStatus()) {
//             case PENDING -> throw new ResponseStatusException(
//                     HttpStatus.FORBIDDEN,
//                     "PENDING||Your account is pending admin approval. Please wait 1–2 business days."
//             );
//             case REJECTED -> throw new ResponseStatusException(
//                     HttpStatus.FORBIDDEN,
//                     "REJECTED||Your account was rejected. Reason: " +
//                             (seller.getRejectionReason() != null
//                                     ? seller.getRejectionReason()
//                                     : "Does not meet requirements.")
//             );
//             case APPROVED -> {
//                 String token = jwtUtil.generateToken(seller.getEmail(), "SELLER");
//                 return ApiResponse.ok("Login successful.", safeSeller(seller), token);
//             }
//         }

//         return ApiResponse.error("Unexpected error.");
//     }

//     // ── Helpers ────────────────────────────────────────────────────────────
//     private void logFileInfo(String name, MultipartFile file) {
//         if (file == null || file.isEmpty()) {
//             log.warn("[SellerService] File '{}' is NULL or EMPTY — will not be saved", name);
//         } else {
//             log.info("[SellerService] File '{}' received — originalName={}, size={}, contentType={}",
//                     name, file.getOriginalFilename(), file.getSize(), file.getContentType());
//         }
//     }

//     // ✅ FIXED: Returns a flat map directly — no nested { "seller": {...} } wrapper
//     // The double-wrap was causing issues when this response was parsed on the frontend
//     private Map<String, Object> safeSeller(Seller s) {
//         Map<String, Object> map = new HashMap<>();
//         map.put("id",                 s.getId());
//         map.put("fullName",           s.getFullName());
//         map.put("email",              s.getEmail());
//         map.put("phone",              s.getPhone());
//         map.put("shopName",           s.getShopName());
//         map.put("businessType",       s.getBusinessType());
//         map.put("approvalStatus",     s.getApprovalStatus());
//         map.put("aadharDocPath",      s.getAadharDocPath());
//         map.put("panDocPath",         s.getPanDocPath());
//         map.put("businessProofPath",  s.getBusinessProofPath());
//         map.put("bankDetailsPath",    s.getBankDetailsPath());
//         map.put("createdAt",          s.getCreatedAt());
//         return map;  // ✅ flat — no wrapper
//     }
// }  





































// ─── src/main/java/com/martzy/backend/service/SellerService.java ───────────
// UPDATED: JWT subject is now seller.getId().toString() so ProductService
//          can extract the numeric seller ID from any authenticated request.
package com.martzy.backend.service;

import com.martzy.backend.dto.LoginDTO;
import com.martzy.backend.model.Seller;
import com.martzy.backend.repository.SellerRepository;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SellerService {

    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;

    // ── Register ───────────────────────────────────────────────────────────
    public ApiResponse register(
            String fullName, String email, String phone, String password,
            String shopName, String businessType, String gstin, String description,
            String address, String address2, String city, String state, String pinCode,
            MultipartFile aadharDoc, MultipartFile panDoc,
            MultipartFile businessProof, MultipartFile bankDetails
    ) {
        log.info("[SellerService] Register attempt — email={}, phone={}", email, phone);

        logFileInfo("aadharDoc",     aadharDoc);
        logFileInfo("panDoc",        panDoc);
        logFileInfo("businessProof", businessProof);
        logFileInfo("bankDetails",   bankDetails);

        // Check duplicates
        if (sellerRepository.existsByEmail(email.toLowerCase().trim())) {
            return ApiResponse.error("Email is already registered.");
        }
        if (sellerRepository.existsByPhone(phone.trim())) {
            return ApiResponse.error("Phone number is already registered.");
        }

        // Save document files to disk
        String aadharPath = null, panPath = null, bProofPath = null, bankPath = null;
        try {
            aadharPath = fileStorageService.store(aadharDoc,    "sellers/aadhar");
            panPath    = fileStorageService.store(panDoc,        "sellers/pan");
            bProofPath = fileStorageService.store(businessProof, "sellers/business_proof");
            bankPath   = fileStorageService.store(bankDetails,   "sellers/bank_details");

            log.info("[SellerService] Files stored — aadhar={}, pan={}, bizProof={}, bank={}",
                    aadharPath, panPath, bProofPath, bankPath);

        } catch (IOException e) {
            log.error("[SellerService] File upload failed!", e);
            return ApiResponse.error("File upload failed: " + e.getMessage() + ". Please try again.");
        }

        Seller seller = Seller.builder()
                .fullName(fullName)
                .email(email.toLowerCase().trim())
                .phone(phone.trim())
                .password(passwordEncoder.encode(password))
                .shopName(shopName)
                .businessType(businessType)
                .gstin(gstin)
                .description(description)
                .address(address)
                .address2(address2)
                .city(city)
                .state(state)
                .pinCode(pinCode)
                .aadharDocPath(aadharPath)
                .panDocPath(panPath)
                .businessProofPath(bProofPath)
                .bankDetailsPath(bankPath)
                .approvalStatus(Seller.ApprovalStatus.PENDING)
                .build();

        sellerRepository.save(seller);

        log.info("[SellerService] Seller saved — id={}, email={}", seller.getId(), seller.getEmail());

        return ApiResponse.ok(
                "Registration submitted. Awaiting admin approval.",
                safeSeller(seller),
                null
        );
    }

    // ── Login ──────────────────────────────────────────────────────────────
    public ApiResponse login(LoginDTO dto) {
        Optional<Seller> optSeller =
                sellerRepository.findByEmailOrPhone(dto.getEmailOrPhone().trim());

        if (optSeller.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "No account found with these credentials."
            );
        }

        Seller seller = optSeller.get();

        if (!passwordEncoder.matches(dto.getPassword(), seller.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password.");
        }

        switch (seller.getApprovalStatus()) {
            case PENDING -> throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "PENDING||Your account is pending admin approval. Please wait 1–2 business days."
            );
            case REJECTED -> throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "REJECTED||Your account was rejected. Reason: " +
                            (seller.getRejectionReason() != null
                                    ? seller.getRejectionReason()
                                    : "Does not meet requirements.")
            );
            case APPROVED -> {
                // ✅ IMPORTANT: subject = seller.getId().toString()
                //    ProductService extracts this to identify the seller on product requests.
                String token = jwtUtil.generateToken(seller.getId().toString(), "SELLER");
                return ApiResponse.ok("Login successful.", safeSeller(seller), token);
            }
        }

        return ApiResponse.error("Unexpected error.");
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private void logFileInfo(String name, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.warn("[SellerService] File '{}' is NULL or EMPTY — will not be saved", name);
        } else {
            log.info("[SellerService] File '{}' received — originalName={}, size={}, contentType={}",
                    name, file.getOriginalFilename(), file.getSize(), file.getContentType());
        }
    }

    private Map<String, Object> safeSeller(Seller s) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",                 s.getId());
        map.put("fullName",           s.getFullName());
        map.put("email",              s.getEmail());
        map.put("phone",              s.getPhone());
        map.put("shopName",           s.getShopName());
        map.put("businessType",       s.getBusinessType());
        map.put("approvalStatus",     s.getApprovalStatus());
        map.put("aadharDocPath",      s.getAadharDocPath());
        map.put("panDocPath",         s.getPanDocPath());
        map.put("businessProofPath",  s.getBusinessProofPath());
        map.put("bankDetailsPath",    s.getBankDetailsPath());
        map.put("createdAt",          s.getCreatedAt());
        return map;
    }
}

