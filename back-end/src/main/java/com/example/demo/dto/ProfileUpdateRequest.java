package com.example.demo.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String nom;
    private String prenom;
    private String email;
}
