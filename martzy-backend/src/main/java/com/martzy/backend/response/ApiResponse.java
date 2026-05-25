// ─── src/main/java/com/martzy/backend/response/ApiResponse.java ───────────
package com.martzy.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse {
    private boolean success;
    private String message;
    private Object data;
    private String token;
    private String status;  // used for seller approval status in error responses

    // ── Quick factory methods ──────────────────────────────────────────────
    public static ApiResponse ok(String message, Object data, String token) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .data(data)
                .token(token)
                .build();
    }

    public static ApiResponse error(String message) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

    public static ApiResponse error(String message, String status) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .status(status)
                .build();
    }
}