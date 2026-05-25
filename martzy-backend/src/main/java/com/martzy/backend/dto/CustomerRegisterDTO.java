// ─── src/main/java/com/martzy/backend/dto/CustomerRegisterDTO.java ─────────
package com.martzy.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomerRegisterDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Enter a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(min = 10, max = 15, message = "Enter a valid phone number")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}