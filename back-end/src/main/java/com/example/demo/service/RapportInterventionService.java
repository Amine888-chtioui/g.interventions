package com.example.demo.service;

import com.example.demo.dto.RapportInterventionRequest;
import com.example.demo.dto.RapportInterventionResponse;
import com.example.demo.entity.Intervention;
import com.example.demo.entity.RapportIntervention;
import com.example.demo.entity.Role;
import com.example.demo.entity.StatutIntervention;
import com.example.demo.entity.User;
import com.example.demo.repository.InterventionRepository;
import com.example.demo.repository.RapportInterventionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RapportInterventionService {

    private final RapportInterventionRepository rapportInterventionRepository;
    private final InterventionRepository interventionRepository;
    private final UserRepository userRepository;

    public RapportInterventionResponse getRapport(Long interventionId, String currentUserEmail) {
        Intervention intervention = findIntervention(interventionId);
        User currentUser = findUser(currentUserEmail);

        boolean isAssignedTechnicien = intervention.getTechnicien() != null
                && intervention.getTechnicien().getId().equals(currentUser.getId());

        if (currentUser.getRole() != Role.ADMIN && !isAssignedTechnicien) {
            throw new RuntimeException("Vous n'êtes pas autorisé à consulter le rapport de cette intervention");
        }

        RapportIntervention rapport = rapportInterventionRepository.findByInterventionId(interventionId)
                .orElseThrow(() -> new RuntimeException("Aucun rapport n'existe pour cette intervention"));

        return toResponse(rapport);
    }

    public RapportInterventionResponse createRapport(Long interventionId, RapportInterventionRequest request, String currentUserEmail) {
        Intervention intervention = findIntervention(interventionId);
        User currentUser = findUser(currentUserEmail);

        checkTechnicienAssigne(intervention, currentUser);

        if (intervention.getStatut() != StatutIntervention.TERMINEE) {
            throw new RuntimeException("Le rapport ne peut être rempli que pour une intervention terminée");
        }
        if (rapportInterventionRepository.existsByInterventionId(interventionId)) {
            throw new RuntimeException("Un rapport existe déjà pour cette intervention");
        }

        RapportIntervention rapport = RapportIntervention.builder()
                .intervention(intervention)
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .descriptionTravaux(request.getDescriptionTravaux())
                .materielUtilise(request.getMaterielUtilise())
                .difficultesRencontrees(request.getDifficultesRencontrees())
                .solutionAppliquee(request.getSolutionAppliquee())
                .observations(request.getObservations())
                .build();

        RapportIntervention saved = rapportInterventionRepository.save(rapport);

        intervention.setRapportDisponible(true);
        interventionRepository.save(intervention);

        return toResponse(saved);
    }

    public RapportInterventionResponse updateRapport(Long interventionId, RapportInterventionRequest request, String currentUserEmail) {
        Intervention intervention = findIntervention(interventionId);
        User currentUser = findUser(currentUserEmail);

        checkTechnicienAssigne(intervention, currentUser);

        RapportIntervention rapport = rapportInterventionRepository.findByInterventionId(interventionId)
                .orElseThrow(() -> new RuntimeException("Aucun rapport à modifier pour cette intervention"));

        rapport.setDateDebut(request.getDateDebut());
        rapport.setDateFin(request.getDateFin());
        rapport.setDescriptionTravaux(request.getDescriptionTravaux());
        rapport.setMaterielUtilise(request.getMaterielUtilise());
        rapport.setDifficultesRencontrees(request.getDifficultesRencontrees());
        rapport.setSolutionAppliquee(request.getSolutionAppliquee());
        rapport.setObservations(request.getObservations());

        return toResponse(rapportInterventionRepository.save(rapport));
    }

    private void checkTechnicienAssigne(Intervention intervention, User currentUser) {
        boolean isAssignedTechnicien = intervention.getTechnicien() != null
                && intervention.getTechnicien().getId().equals(currentUser.getId());

        if (!isAssignedTechnicien) {
            throw new RuntimeException("Vous n'êtes pas autorisé à gérer le rapport de cette intervention");
        }
    }

    private Intervention findIntervention(Long id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention non trouvée"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    private RapportInterventionResponse toResponse(RapportIntervention rapport) {
        Intervention intervention = rapport.getIntervention();
        User technicien = intervention.getTechnicien();

        return new RapportInterventionResponse(
                rapport.getId(),
                intervention.getId(),
                intervention.getTitre(),
                technicien != null ? technicien.getId() : null,
                technicien != null ? technicien.getNom() : null,
                technicien != null ? technicien.getPrenom() : null,
                rapport.getDateDebut(),
                rapport.getDateFin(),
                rapport.getDescriptionTravaux(),
                rapport.getMaterielUtilise(),
                rapport.getDifficultesRencontrees(),
                rapport.getSolutionAppliquee(),
                rapport.getObservations(),
                rapport.getDateCreation(),
                rapport.getDateModification()
        );
    }
}
