// ─── src/main/java/com/martzy/backend/service/CustomerService.java ─────────
package com.martzy.backend.service;

import com.martzy.backend.dto.CustomerRegisterDTO;
import com.martzy.backend.dto.LoginDTO;
import com.martzy.backend.model.Customer;
import com.martzy.backend.repository.CustomerRepository;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ── Register ───────────────────────────────────────────────────────────
    public ApiResponse register(CustomerRegisterDTO dto) {
        // Check duplicates
        if (customerRepository.existsByEmail(dto.getEmail())) {
            return ApiResponse.error("Email is already registered.");
        }
        if (customerRepository.existsByPhone(dto.getPhone())) {
            return ApiResponse.error("Phone number is already registered.");
        }

        Customer customer = Customer.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail().toLowerCase().trim())
                .phone(dto.getPhone().trim())
                .password(passwordEncoder.encode(dto.getPassword()))
                .build();

        customerRepository.save(customer);
        return ApiResponse.ok("Registration successful.", safeCustomer(customer), null);
    }

    // ── Login ──────────────────────────────────────────────────────────────
    public ApiResponse login(LoginDTO dto) {
        Optional<Customer> optCustomer =
                customerRepository.findByEmailOrPhone(dto.getEmailOrPhone().trim());

        if (optCustomer.isEmpty()) {
            return ApiResponse.error("No account found with these credentials.");
        }

        Customer customer = optCustomer.get();

        if (!passwordEncoder.matches(dto.getPassword(), customer.getPassword())) {
            return ApiResponse.error("Invalid password.");
        }

        String token = jwtUtil.generateToken(customer.getEmail(), "CUSTOMER");
        return ApiResponse.ok("Login successful.", safeCustomer(customer), token);
    }

    // ── Return customer without password ──────────────────────────────────
    private Object safeCustomer(Customer c) {
        return new java.util.HashMap<String, Object>() {{
            put("id", c.getId());
            put("fullName", c.getFullName());
            put("email", c.getEmail());
            put("phone", c.getPhone());
            put("createdAt", c.getCreatedAt());
        }};
    }
}  









