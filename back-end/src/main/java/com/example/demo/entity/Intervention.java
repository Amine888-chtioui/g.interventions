package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "interventions", indexes = {
        @Index(name = "idx_intervention_statut", columnList = "statut"),
        @Index(name = "idx_intervention_priorite", columnList = "priorite")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    private LocalDate dateIntervention;

    private LocalDateTime dateCreation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutIntervention statut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'NORMALE'")
    private PrioriteIntervention priorite;

    @ManyToOne
    @JoinColumn(name = "technicien_id")
    private User technicien;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }
}
