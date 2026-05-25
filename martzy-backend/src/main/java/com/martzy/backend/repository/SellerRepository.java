// ─── src/main/java/com/martzy/backend/repository/SellerRepository.java ─────
package com.martzy.backend.repository;

import com.martzy.backend.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {

    Optional<Seller> findByEmail(String email);

    Optional<Seller> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<Seller> findByApprovalStatus(Seller.ApprovalStatus status);

    // Login: match by email OR phone
    default Optional<Seller> findByEmailOrPhone(String emailOrPhone) {
        Optional<Seller> byEmail = findByEmail(emailOrPhone);
        if (byEmail.isPresent()) return byEmail;
        return findByPhone(emailOrPhone);
    }
}