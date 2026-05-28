package com.martzy.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(name = "delivery_partner_id", nullable = false)
    private Long deliveryPartnerId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    /**
     * Status: ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
     */
    @Column(nullable = false)
    @Builder.Default
    private String status = "ASSIGNED";

    @Column(name = "delivery_note", columnDefinition = "TEXT")
    private String deliveryNote;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
