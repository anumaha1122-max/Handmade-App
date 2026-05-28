package com.martzy.backend.repository;

import com.martzy.backend.model.CommissionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommissionRecordRepository extends JpaRepository<CommissionRecord, Long> {
    // Additional query methods can be defined here if needed
}
