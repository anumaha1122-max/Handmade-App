package com.martzy.backend.dto;

import lombok.Data;

@Data
public class ComplaintRespondDTO {
    private String sellerResponse;  // used by seller
    private String adminNote;       // used by admin
    // "IN_PROGRESS", "RESOLVED", "CLOSED"
    private String status;
}
