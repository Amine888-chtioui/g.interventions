package com.example.demo.repository;

import com.example.demo.entity.PhotoIntervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PhotoInterventionRepository extends JpaRepository<PhotoIntervention, Long> {
    List<PhotoIntervention> findByInterventionId(Long interventionId);

    long countByInterventionId(Long interventionId);

    @Query("select p.intervention.id as interventionId, count(p) as total " +
            "from PhotoIntervention p where p.intervention.id in :interventionIds group by p.intervention.id")
    List<InterventionPhotoCount> countByInterventionIds(@Param("interventionIds") Collection<Long> interventionIds);

    interface InterventionPhotoCount {
        Long getInterventionId();
        Long getTotal();
    }
}
