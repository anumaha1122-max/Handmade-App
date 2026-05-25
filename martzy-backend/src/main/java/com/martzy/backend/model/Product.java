// ─── src/main/java/com/martzy/backend/model/Product.java ───────────────────
package com.martzy.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Product Info ──────────────────────────────────────────────────────
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "discount_percent")
    @Builder.Default
    private Double discountPercent = 0.0;

    @Column(nullable = false)
    private Integer stock;

    private String category;
    private String subcategory;
    private String sku;
    private String weight;
    private String size;
    private String material;
    private String color;

    @Column(name = "delivery_info")
    private String deliveryInfo;

    @Column(name = "return_policy")
    private String returnPolicy;

    // ── Image path stored on server ───────────────────────────────────────
    @Column(name = "image_path")
    private String imagePath;

    // ── Seller Reference ──────────────────────────────────────────────────
    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "seller_name")
    private String sellerName;

    // ── Status ────────────────────────────────────────────────────────────
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "payment_status")
    @Builder.Default
    private String paymentStatus = "PAID";

    // ── Timestamps ────────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
