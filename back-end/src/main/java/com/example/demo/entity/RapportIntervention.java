package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rapports_intervention")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapportIntervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "intervention_id", nullable = false, unique = true)
    private Intervention intervention;

    private LocalDateTime dateDebut;

    private LocalDateTime dateFin;

    @Column(length = 4000)
    private String descriptionTravaux;

    @Column(length = 2000)
    private String materielUtilise;

    @Column(length = 2000)
    private String difficultesRencontrees;

    @Column(length = 2000)
    private String solutionAppliquee;

    @Column(length = 2000)
    private String observations;

    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        this.dateModification = this.dateCreation;
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
