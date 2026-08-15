package com.teamproject.backend.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // In production, load this from an environment variable, not hardcoded.
    // For now, this is a placeholder secret — replace with a real env var (JWT_SECRET) before demo.
    private final SecretKey secretKey = Keys.hmacShaKeyFor(
            System.getenv("JWT_SECRET").getBytes());

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

    // Creates a token containing the user's ID and email
    public String generateToken(String userId, String email) {
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extracts the user ID stored inside a token
    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    // Extracts the email stored inside a token
    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    // Returns true if the token is valid and not expired
    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}