package com.martzy.backend.dto;

import lombok.Data;

@Data
public class ReturnRespondDTO {
    // "APPROVED" or "REJECTED"
    private String status;
    private String sellerNote;
    private Double refundAmount;
}
