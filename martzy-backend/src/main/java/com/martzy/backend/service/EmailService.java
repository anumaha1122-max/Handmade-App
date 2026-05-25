// ─── src/main/java/com/martzy/backend/service/EmailService.java ──────────────
package com.martzy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Martzy Admin Portal - Secure Password Reset Code");
            message.setText(
                "Hello Administrator,\n\n" +
                "You requested a password reset for your Martzy Admin Portal account.\n\n" +
                "Your 6-digit secure password reset token is: " + resetCode + "\n\n" +
                "This token will expire in 15 minutes.\n\n" +
                "If you did not request this password reset, please ignore this email or contact support.\n\n" +
                "Best regards,\n" +
                "Martzy Team"
            );
            message.setFrom("no-reply@martzy.com");

            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", toEmail, e);
        }
    }
}
