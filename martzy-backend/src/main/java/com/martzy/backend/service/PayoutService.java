package com.martzy.backend.service;

import com.martzy.backend.model.Payout;
import com.martzy.backend.repository.PayoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import java.time.LocalDateTime;

@Service
public class PayoutService {
    private final PayoutRepository payoutRepo;

    public PayoutService(PayoutRepository payoutRepo) {
        this.payoutRepo = payoutRepo;
    }

    public @NonNull Payout requestPayout(Long sellerId, Double amount) {
        Payout payout = Payout.builder()
                .sellerId(sellerId)
                .amount(amount)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
        return payoutRepo.save(payout);
    }

    // Additional methods like getBySeller, updateStatus can be added later
}
