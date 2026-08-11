package com.example.demo.repository;

import com.example.demo.entity.RapportIntervention;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RapportInterventionRepository extends JpaRepository<RapportIntervention, Long> {
    Optional<RapportIntervention> findByInterventionId(Long interventionId);

    boolean existsByInterventionId(Long interventionId);
}
