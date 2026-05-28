package com.martzy.backend.dto;

import lombok.Data;

@Data
public class MessageDTO {
    private Long orderId;
    private String content;
    // "CUSTOMER" or "SELLER" — derived server-side from the token, not trusted from client
    private String senderType;
}
