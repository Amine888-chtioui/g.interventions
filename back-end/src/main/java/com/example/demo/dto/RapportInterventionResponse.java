package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RapportInterventionResponse {
    private Long id;
    private Long interventionId;
    private String interventionTitre;
    private Long technicienId;
    private String technicienNom;
    private String technicienPrenom;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String descriptionTravaux;
    private String materielUtilise;
    private String difficultesRencontrees;
    private String solutionAppliquee;
    private String observations;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}
