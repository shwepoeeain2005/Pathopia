package com.teamproject.backend.repository;

import com.teamproject.backend.model.Trait;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TraitRepository extends JpaRepository<Trait, String> {

    // Get all 5 shared traits (careerId is null)
    List<Trait> findByType(String type);

    // Get the 5 role-specific traits for one career
    List<Trait> findByCareerId(String careerId);
}