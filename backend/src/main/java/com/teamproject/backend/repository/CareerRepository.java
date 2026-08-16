package com.teamproject.backend.repository;

import com.teamproject.backend.model.Career;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareerRepository extends JpaRepository<Career, String> {
}