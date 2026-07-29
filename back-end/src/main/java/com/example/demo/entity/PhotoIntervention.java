package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "photos_intervention")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoIntervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "intervention_id", nullable = false)
    private Intervention intervention;

    @Column(nullable = false)
    private String cheminFichier;

    private String nomOriginal;

    private String contentType;

    private LocalDateTime dateAjout;

    @PrePersist
    protected void onCreate() {
        this.dateAjout = LocalDateTime.now();
    }
}
