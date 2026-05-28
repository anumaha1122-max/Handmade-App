package com.martzy.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Size(min = 10, max = 15, message = "Enter a valid phone number")
    private String phone;

    private String dateOfBirth;

    private String gender;
}
