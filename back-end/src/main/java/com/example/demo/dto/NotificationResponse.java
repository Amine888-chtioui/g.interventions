package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String message;
    private String type;
    private Long interventionId;
    private boolean lue;
    private LocalDateTime dateCreation;
}
