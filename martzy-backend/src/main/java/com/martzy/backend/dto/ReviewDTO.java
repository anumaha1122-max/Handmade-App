package com.martzy.backend.dto;

import lombok.Data;

@Data
public class ReviewDTO {
    private Long orderId;
    private Long productId;
    private Integer rating;   // 1–5
    private String comment;
}
