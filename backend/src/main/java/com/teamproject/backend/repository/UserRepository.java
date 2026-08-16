package com.teamproject.backend.repository;

import com.teamproject.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Used during login to look up a user by email
    Optional<User> findByEmail(String email);

    // Used during registration to check if an email is already taken
    boolean existsByEmail(String email);
}