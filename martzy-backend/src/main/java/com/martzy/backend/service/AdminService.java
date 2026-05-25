// ─── src/main/java/com/martzy/backend/service/AdminService.java ─────────────
package com.martzy.backend.service;

import com.martzy.backend.dto.AdminLoginDTO;
import com.martzy.backend.model.Admin;
import com.martzy.backend.repository.AdminRepository;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    // ── Login ──────────────────────────────────────────────────────────────
    public ApiResponse login(AdminLoginDTO dto) {
        Optional<Admin> optAdmin = adminRepository.findByEmail(dto.getEmail().toLowerCase().trim());

        if (optAdmin.isEmpty()) {
            return ApiResponse.error("No admin account found with this email.");
        }

        Admin admin = optAdmin.get();

        if (!passwordEncoder.matches(dto.getPassword(), admin.getPassword())) {
            return ApiResponse.error("Invalid password.");
        }

        String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN");
        return ApiResponse.ok("Admin login successful.", safeAdmin(admin), token);
    }

    // ── Forgot Password ────────────────────────────────────────────────────
    public ApiResponse forgotPassword(String email) {
        Optional<Admin> optAdmin = adminRepository.findByEmail(email.toLowerCase().trim());

        if (optAdmin.isEmpty()) {
            return ApiResponse.error("No admin account found with this email.");
        }

        Admin admin = optAdmin.get();

        // Generate 6-digit numeric reset token
        String resetToken = String.format("%06d", new Random().nextInt(1000000));
        admin.setResetToken(resetToken);
        admin.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15)); // expires in 15 minutes
        adminRepository.save(admin);

        // Send actual email asynchronously
        emailService.sendPasswordResetEmail(admin.getEmail(), resetToken);

        // Print to console to simulate sending email (so they can also view it in logs)
        System.out.println("\n==================================================");
        System.out.println("MARTZY SECURE PASSWORD RESET");
        System.out.println("To: " + admin.getEmail());
        System.out.println("Your 6-Digit Password Reset Token is: " + resetToken);
        System.out.println("==================================================\n");

        return ApiResponse.ok("A password reset token has been sent to your email.", null, null);
    }

    // ── Reset Password ─────────────────────────────────────────────────────
    public ApiResponse resetPassword(String email, String token, String newPassword) {
        Optional<Admin> optAdmin = adminRepository.findByEmail(email.toLowerCase().trim());

        if (optAdmin.isEmpty()) {
            return ApiResponse.error("No admin account found with this email.");
        }

        Admin admin = optAdmin.get();

        if (admin.getResetToken() == null || !admin.getResetToken().equals(token.trim())) {
            return ApiResponse.error("Invalid password reset token.");
        }

        if (admin.getResetTokenExpiry() == null || admin.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ApiResponse.error("Password reset token has expired.");
        }

        // Token is valid! Update password
        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setResetToken(null);
        admin.setResetTokenExpiry(null);
        adminRepository.save(admin);

        return ApiResponse.ok("Password has been reset successfully. Please login with your new password.", null, null);
    }

    // ── Return admin info without password ──────────────────────────────────
    private Object safeAdmin(Admin a) {
        HashMap<String, Object> map = new HashMap<>();
        map.put("id", a.getId());
        map.put("fullName", a.getFullName());
        map.put("email", a.getEmail());
        map.put("role", a.getRole());
        map.put("createdAt", a.getCreatedAt());
        return map;
    }
}
