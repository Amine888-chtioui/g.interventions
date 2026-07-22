package com.example.demo.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String nom;
    private String prenom;
    private String email;
    private String role;
}
