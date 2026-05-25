// ─── src/main/java/com/martzy/backend/security/JwtUtil.java ───────────────
package com.martzy.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // ── Generate token ─────────────────────────────────────────────────────
    public String generateToken(String subject, String role) {
        return Jwts.builder()
                .subject(subject)                          // ✅ was .setSubject()
                .claim("role", role)
                .issuedAt(new Date())                      // ✅ was .setIssuedAt()
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))  // ✅ was .setExpiration()
                .signWith(getSigningKey())                 // ✅ no SignatureAlgorithm needed
                .compact();
    }

    // ── Extract subject ────────────────────────────────────────────────────
    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    // ── Validate token ─────────────────────────────────────────────────────
    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()                               // ✅ was .parserBuilder()
                .verifyWith(getSigningKey())               // ✅ was .setSigningKey()
                .build()
                .parseSignedClaims(token)                  // ✅ was .parseClaimsJws()
                .getPayload();                             // ✅ was .getBody()
    }
}