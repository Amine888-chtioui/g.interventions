package com.example.demo.repository;

import com.example.demo.entity.Intervention;
import com.example.demo.entity.PrioriteIntervention;
import com.example.demo.entity.StatutIntervention;
import com.example.demo.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class InterventionSpecifications {

    private InterventionSpecifications() {
    }

    public static Specification<Intervention> search(String q, StatutIntervention statut, PrioriteIntervention priorite) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase() + "%";
                Join<Intervention, User> technicien = root.join("technicien", JoinType.LEFT);

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("titre")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(technicien.get("nom")), pattern),
                        cb.like(cb.lower(technicien.get("prenom")), pattern),
                        cb.like(cb.lower(cb.concat(cb.concat(technicien.get("prenom"), " "), technicien.get("nom"))), pattern)
                ));
            }

            if (statut != null) {
                predicates.add(cb.equal(root.get("statut"), statut));
            }

            if (priorite != null) {
                predicates.add(cb.equal(root.get("priorite"), priorite));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
