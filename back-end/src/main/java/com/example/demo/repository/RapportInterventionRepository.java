package com.example.demo.repository;

import com.example.demo.entity.RapportIntervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RapportInterventionRepository extends JpaRepository<RapportIntervention, Long> {
    Optional<RapportIntervention> findByInterventionId(Long interventionId);

    boolean existsByInterventionId(Long interventionId);

    @Query("select r.intervention.id from RapportIntervention r where r.intervention.id in :interventionIds")
    List<Long> findInterventionIdsWithRapport(@Param("interventionIds") Collection<Long> interventionIds);
}
