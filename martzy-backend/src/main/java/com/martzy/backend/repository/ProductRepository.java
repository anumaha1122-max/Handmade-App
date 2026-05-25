// ─── src/main/java/com/martzy/backend/repository/ProductRepository.java ────
package com.martzy.backend.repository;

import com.martzy.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // All active products visible to customers (from all approved sellers)
    List<Product> findByIsActiveTrue();

    // All products belonging to a specific seller
    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    // Active products belonging to a specific seller
    List<Product> findBySellerIdAndIsActiveTrue(Long sellerId);
}
