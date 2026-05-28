package com.martzy.backend.service;

import com.martzy.backend.model.WalletTransaction;
import com.martzy.backend.repository.WalletTransactionRepository;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
@Service
public class FinancialService {
    private final WalletTransactionRepository walletTransactionRepository;

    public FinancialService(WalletTransactionRepository walletTransactionRepository) {
        this.walletTransactionRepository = walletTransactionRepository;
    }

    public Double getBalance(Long customerId) {
        List<WalletTransaction> transactions = walletTransactionRepository.findByCustomerId(customerId);
        double balance = 0.0;
        for (WalletTransaction tx : transactions) {
            balance += tx.getAmount();
        }
        return balance;
    }

    public List<WalletTransaction> getTransactions(Long customerId) {
        return walletTransactionRepository.findByCustomerId(customerId);
    }

    public @NonNull WalletTransaction recordTransaction(@NonNull WalletTransaction tx) {
        return walletTransactionRepository.save(tx);
    }
}
