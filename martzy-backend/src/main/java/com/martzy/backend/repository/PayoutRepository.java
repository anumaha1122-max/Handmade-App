package com.martzy.backend.repository;

import com.martzy.backend.model.Payout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long> {
    // Find payouts by seller
    java.util.List<Payout> findBySellerId(Long sellerId);
}
