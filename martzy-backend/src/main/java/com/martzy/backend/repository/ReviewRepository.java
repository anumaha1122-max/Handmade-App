package com.martzy.backend.repository;

import com.martzy.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<Review> findByOrderIdAndProductId(Long orderId, Long productId);
    boolean existsByOrderIdAndProductId(Long orderId, Long productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.productId = :productId")
    Double averageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.productId = :productId")
    Long countByProductId(@Param("productId") Long productId);
}
