package com.martzy.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Who this notification is for: CUSTOMER | SELLER | ADMIN
     */
    @Column(name = "target_role", nullable = false, length = 10)
    private String targetRole;

    /**
     * The ID of the customer/seller/admin this notification belongs to.
     * For ADMIN role, use 0 (broadcast to all admins).
     */
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * Type for icon rendering: order | complaint | return | review | payment | system
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String type = "system";

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "reference_id")
    private Long referenceId; // e.g. orderId, complaintId

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
