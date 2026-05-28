package com.martzy.backend.repository;

import com.martzy.backend.model.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<ReturnRequest> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    Optional<ReturnRequest> findByOrderIdAndCustomerId(Long orderId, Long customerId);
    boolean existsByOrderIdAndCustomerId(Long orderId, Long customerId);
}
