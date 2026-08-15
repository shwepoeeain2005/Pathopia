package com.teamproject.backend.controller;

import com.teamproject.backend.config.JwtUtil;
import com.teamproject.backend.dto.AuthResponse;
import com.teamproject.backend.dto.LoginRequest;
import com.teamproject.backend.dto.RegisterRequest;
import com.teamproject.backend.model.User;
import com.teamproject.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // Basic validation
        if (request.getEmail() == null || request.getPassword() == null || request.getFullName() == null) {
            return ResponseEntity.badRequest().body("Name, email, and password are all required.");
        }

        if (request.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body("Password must be at least 8 characters.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword())); // never store plain text

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getId().toString(), savedUser.getEmail());

        AuthResponse response = new AuthResponse(
                token,
                savedUser.getId().toString(),
                savedUser.getFullName(),
                savedUser.getEmail()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            // Deliberately vague — don't reveal whether it was the email or password that was wrong
            return ResponseEntity.status(401).body("Invalid email or password.");
        }

        String token = jwtUtil.generateToken(user.getId().toString(), user.getEmail());

        AuthResponse response = new AuthResponse(
                token,
                user.getId().toString(),
                user.getFullName(),
                user.getEmail()
        );

        return ResponseEntity.ok(response);
    }
}