// ─── src/main/java/com/martzy/backend/service/AdminDataSeeder.java ───────────
package com.martzy.backend.service;

import com.martzy.backend.model.Admin;
import com.martzy.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AdminDataSeeder implements ApplicationRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Seed default admin if no admin exists
        if (adminRepository.count() == 0) {
            log.info("No admin found. Seeding default admin account...");
            Admin defaultAdmin = Admin.builder()
                    .fullName("Super Admin")
                    .email("admin@martzy.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role("ADMIN")
                    .build();

            adminRepository.save(defaultAdmin);
            log.info("Default admin account successfully seeded (admin@martzy.com / Admin@123).");
        } else {
            log.info("Admin account already exists in DB. Skipping seeder.");
        }
    }
}
