package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RapportInterventionRequest {
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String descriptionTravaux;
    private String materielUtilise;
    private String difficultesRencontrees;
    private String solutionAppliquee;
    private String observations;
}
