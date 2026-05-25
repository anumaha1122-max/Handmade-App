// ─── src/main/java/com/martzy/backend/model/Seller.java ───────────────────
package com.martzy.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sellers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Personal ──────────────────────────────────────────────────────────
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false, length = 15)
    private String phone;

    @Column(nullable = false)
    private String password;   // BCrypt hash

    // ── Business ──────────────────────────────────────────────────────────
    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "business_type")
    private String businessType;

    @Column(name = "gstin")
    private String gstin;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ── Address ───────────────────────────────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "address2", columnDefinition = "TEXT")
    private String address2;

    private String city;
    private String state;

    @Column(name = "pin_code", length = 6)
    private String pinCode;

    // ── Documents (file paths on server) ──────────────────────────────────
    @Column(name = "aadhar_doc_path")
    private String aadharDocPath;

    @Column(name = "pan_doc_path")
    private String panDocPath;

    @Column(name = "business_proof_path")
    private String businessProofPath;

    @Column(name = "bank_details_path")
    private String bankDetailsPath;

    // ── Admin Approval ────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Enum ──────────────────────────────────────────────────────────────
    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}