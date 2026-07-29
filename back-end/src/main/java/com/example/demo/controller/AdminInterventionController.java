package com.example.demo.controller;

import com.example.demo.dto.InterventionRequest;
import com.example.demo.dto.InterventionResponse;
import com.example.demo.service.InterventionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/interventions")
@RequiredArgsConstructor
public class AdminInterventionController {

    private final InterventionService interventionService;

    @GetMapping
    public ResponseEntity<List<InterventionResponse>> getAllInterventions(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String priorite) {
        return ResponseEntity.ok(interventionService.getAllInterventions(q, statut, priorite));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterventionResponse> getIntervention(@PathVariable Long id) {
        return ResponseEntity.ok(interventionService.getIntervention(id));
    }

    @PostMapping
    public ResponseEntity<InterventionResponse> createIntervention(@RequestBody InterventionRequest request) {
        return ResponseEntity.ok(interventionService.createIntervention(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterventionResponse> updateIntervention(@PathVariable Long id, @RequestBody InterventionRequest request) {
        return ResponseEntity.ok(interventionService.updateIntervention(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIntervention(@PathVariable Long id) {
        interventionService.deleteIntervention(id);
        return ResponseEntity.noContent().build();
    }
}
