package com.martzy.backend.repository;

import com.martzy.backend.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Complaint> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
