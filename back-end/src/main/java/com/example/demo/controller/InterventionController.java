package com.example.demo.controller;

import com.example.demo.dto.InterventionResponse;
import com.example.demo.dto.StatutUpdateRequest;
import com.example.demo.service.InterventionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interventions")
@RequiredArgsConstructor
public class InterventionController {

    private final InterventionService interventionService;

    @GetMapping("/mine")
    public ResponseEntity<List<InterventionResponse>> getMyInterventions(Authentication authentication) {
        return ResponseEntity.ok(interventionService.getInterventionsForCurrentUser(authentication.getName()));
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<InterventionResponse> updateStatut(
            @PathVariable Long id,
            @RequestBody StatutUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(interventionService.updateStatut(id, request.getStatut(), authentication.getName()));
    }
}
