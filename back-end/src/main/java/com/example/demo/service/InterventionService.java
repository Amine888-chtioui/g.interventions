package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.InterventionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<InterventionResponse> getAllInterventions() {
        return interventionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<InterventionResponse> getInterventionsForCurrentUser(String email) {
        User technicien = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return interventionRepository.findByTechnicienId(technicien.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public InterventionResponse getIntervention(Long id) {
        return toResponse(findById(id));
    }

    public InterventionResponse createIntervention(InterventionRequest request) {
        User technicien = resolveTechnicien(request.getTechnicienId());

        Intervention intervention = Intervention.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .dateIntervention(request.getDateIntervention())
                .statut(parseStatut(request.getStatut(), StatutIntervention.EN_ATTENTE))
                .technicien(technicien)
                .build();

        intervention = interventionRepository.save(intervention);

        if (technicien != null) {
            notificationService.notifyAssignation(technicien, intervention.getId(), intervention.getTitre());
        }

        return toResponse(intervention);
    }

    public InterventionResponse updateIntervention(Long id, InterventionRequest request) {
        Intervention intervention = findById(id);
        Long previousTechnicienId = intervention.getTechnicien() != null
                ? intervention.getTechnicien().getId()
                : null;

        User technicien = resolveTechnicien(request.getTechnicienId());

        intervention.setTitre(request.getTitre());
        intervention.setDescription(request.getDescription());
        intervention.setDateIntervention(request.getDateIntervention());
        intervention.setTechnicien(technicien);
        intervention.setStatut(parseStatut(request.getStatut(), intervention.getStatut()));

        intervention = interventionRepository.save(intervention);

        boolean reassignee = technicien != null && !technicien.getId().equals(previousTechnicienId);
        if (reassignee) {
            notificationService.notifyAssignation(technicien, intervention.getId(), intervention.getTitre());
        }

        return toResponse(intervention);
    }

    public InterventionResponse updateStatut(Long id, String statut, String currentUserEmail) {
        Intervention intervention = findById(id);
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        boolean isAssignedTechnicien = intervention.getTechnicien() != null
                && intervention.getTechnicien().getId().equals(currentUser.getId());

        if (currentUser.getRole() != Role.ADMIN && !isAssignedTechnicien) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette intervention");
        }

        StatutIntervention statutPrecedent = intervention.getStatut();
        StatutIntervention nouveauStatut = parseStatut(statut, statutPrecedent);
        intervention.setStatut(nouveauStatut);
        intervention = interventionRepository.save(intervention);

        boolean vientDEtreTerminee = nouveauStatut == StatutIntervention.TERMINEE
                && statutPrecedent != StatutIntervention.TERMINEE;

        if (vientDEtreTerminee && currentUser.getRole() == Role.TECHNICIEN) {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            String technicienNomComplet = (currentUser.getPrenom() + " " + currentUser.getNom()).trim();
            notificationService.notifyTerminee(admins, intervention.getId(), intervention.getTitre(), technicienNomComplet);
        }

        return toResponse(intervention);
    }

    public void deleteIntervention(Long id) {
        if (!interventionRepository.existsById(id)) {
            throw new RuntimeException("Intervention non trouvée");
        }
        interventionRepository.deleteById(id);
    }

    private Intervention findById(Long id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention non trouvée"));
    }

    private User resolveTechnicien(Long technicienId) {
        if (technicienId == null) {
            return null;
        }
        return userRepository.findById(technicienId)
                .orElseThrow(() -> new RuntimeException("Technicien non trouvé"));
    }

    private StatutIntervention parseStatut(String statut, StatutIntervention fallback) {
        if (statut == null || statut.isBlank()) {
            return fallback;
        }
        return StatutIntervention.valueOf(statut.toUpperCase());
    }

    private InterventionResponse toResponse(Intervention intervention) {
        User technicien = intervention.getTechnicien();
        return new InterventionResponse(
                intervention.getId(),
                intervention.getTitre(),
                intervention.getDescription(),
                intervention.getDateIntervention(),
                intervention.getDateCreation(),
                intervention.getStatut().name(),
                technicien != null ? technicien.getId() : null,
                technicien != null ? technicien.getNom() : null,
                technicien != null ? technicien.getPrenom() : null
        );
    }
}
