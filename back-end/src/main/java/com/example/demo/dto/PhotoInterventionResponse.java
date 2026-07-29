package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PhotoInterventionResponse {
    private Long id;
    private Long interventionId;
    private String nomOriginal;
    private LocalDateTime dateAjout;
}
