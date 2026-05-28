package com.martzy.backend.service;

import com.martzy.backend.model.CommissionRecord;
import com.martzy.backend.repository.CommissionRecordRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommissionService {
    private final CommissionRecordRepository commissionRecordRepository;

    public CommissionService(CommissionRecordRepository commissionRecordRepository) {
        this.commissionRecordRepository = commissionRecordRepository;
    }

    /**
     * Retrieve all commission records.
     * @return List of CommissionRecord objects.
     */
    public List<CommissionRecord> getAllCommissions() {
        return commissionRecordRepository.findAll();
    }
}
