package com.martzy.backend.repository;

import com.martzy.backend.model.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    // Add custom query methods if needed, e.g., findByStatus
}
