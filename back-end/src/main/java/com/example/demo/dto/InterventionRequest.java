package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InterventionRequest {
    private String titre;
    private String description;
    private LocalDate dateIntervention;
    private Long technicienId;
    private String statut;
}
