// ─── src/main/java/com/martzy/backend/dto/AdminResetPasswordDTO.java ─────────
package com.martzy.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminResetPasswordDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    private String email;

    @NotBlank(message = "Reset token is required")
    @Size(min = 6, max = 6, message = "Reset token must be exactly 6 digits")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;
}
