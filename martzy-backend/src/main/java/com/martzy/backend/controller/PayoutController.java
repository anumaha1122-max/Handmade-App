package com.martzy.backend.controller;

import com.martzy.backend.model.Payout;
import com.martzy.backend.service.PayoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;

@RestController
@RequestMapping("/api/payouts")
public class PayoutController {
    private final PayoutService payoutService;

    public PayoutController(PayoutService payoutService) {
        this.payoutService = payoutService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestPayout(@RequestBody PayoutRequest request) {
        // Assuming request contains sellerId and amount
        Payout payout = payoutService.requestPayout(request.getSellerId(), request.getAmount());
        HashMap<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("payout", payout);
        return ResponseEntity.ok().body(resp);
    }
}

class PayoutRequest {
    private Long sellerId;
    private Double amount;

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}
