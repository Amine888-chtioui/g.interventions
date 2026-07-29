package com.example.demo.repository;

import com.example.demo.entity.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<User> search(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) {
                return cb.conjunction();
            }

            String pattern = "%" + q.trim().toLowerCase() + "%";
            Predicate nomMatch = cb.like(cb.lower(root.get("nom")), pattern);
            Predicate prenomMatch = cb.like(cb.lower(root.get("prenom")), pattern);
            Predicate emailMatch = cb.like(cb.lower(root.get("email")), pattern);
            Predicate nomCompletMatch = cb.like(
                    cb.lower(cb.concat(cb.concat(root.get("prenom"), " "), root.get("nom"))),
                    pattern
            );

            return cb.or(nomMatch, prenomMatch, emailMatch, nomCompletMatch);
        };
    }
}
