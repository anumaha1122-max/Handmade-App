package com.martzy.backend.controller;

import com.martzy.backend.model.WalletTransaction;
import com.martzy.backend.service.FinancialService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finances")

public class FinancialController {
    private final FinancialService financialService;

    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }

    // Get wallet balance for a customer
    @GetMapping("/wallet/{customerId}")
    public ResponseEntity<?> getWalletBalance(@PathVariable Long customerId) {
        Double balance = financialService.getBalance(customerId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("balance", balance);
        return ResponseEntity.ok().body(resp);
    }

    // Get paginated wallet transactions for a customer
    @GetMapping("/transactions/{customerId}")
    public ResponseEntity<?> getTransactions(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<WalletTransaction> all = financialService.getTransactions(customerId);
        int fromIndex = Math.min(page * size, all.size());
        int toIndex = Math.min(fromIndex + size, all.size());
        List<WalletTransaction> pageList = all.subList(fromIndex, toIndex);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("transactions", pageList);
        resp.put("page", page);
        resp.put("size", size);
        resp.put("total", all.size());
        return ResponseEntity.ok().body(resp);
    }

    // Record a new wallet transaction
    @PostMapping("/transactions")
    public ResponseEntity<?> recordTransaction(@RequestBody @NonNull WalletTransaction tx) {
        WalletTransaction saved = financialService.recordTransaction(tx);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("transaction", saved);
        return ResponseEntity.ok().body(resp);
    }
}
