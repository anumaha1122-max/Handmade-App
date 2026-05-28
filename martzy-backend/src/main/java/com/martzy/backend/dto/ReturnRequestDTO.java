package com.martzy.backend.dto;

import lombok.Data;

@Data
public class ReturnRequestDTO {
    private Long orderId;
    private String reason;       // e.g. "Damaged", "Wrong item", "Not as described"
    private String description;  // optional extra detail
}
