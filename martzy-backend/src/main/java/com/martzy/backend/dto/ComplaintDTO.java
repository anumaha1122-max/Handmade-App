package com.martzy.backend.dto;

import lombok.Data;

@Data
public class ComplaintDTO {
    private Long orderId;
    private String subject;
    private String description;
}
