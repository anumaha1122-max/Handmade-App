// ─── src/main/java/com/martzy/backend/dto/LoginDTO.java ───────────────────
package com.martzy.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDTO {

    @NotBlank(message = "Email or phone is required")
    private String emailOrPhone;

    @NotBlank(message = "Password is required")
    private String password;
}