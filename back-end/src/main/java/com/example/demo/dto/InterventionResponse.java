package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InterventionResponse {
    private Long id;
    private String titre;
    private String description;
    private LocalDate dateIntervention;
    private LocalDateTime dateCreation;
    private String statut;
    private String priorite;
    private Long technicienId;
    private String technicienNom;
    private String technicienPrenom;
    private boolean rapportDisponible;
    private int nombrePhotos;
}
