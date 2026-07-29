package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.InterventionRepository;
import com.example.demo.repository.InterventionSpecifications;
import com.example.demo.repository.PhotoInterventionRepository;
import com.example.demo.repository.RapportInterventionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RapportInterventionRepository rapportInterventionRepository;
    private final PhotoInterventionRepository photoInterventionRepository;

    public List<InterventionResponse> getAllInterventions(String q, String statut, String priorite) {
        Specification<Intervention> spec = InterventionSpecifications.search(
                q,
                parseStatutFilter(statut),
                parsePrioriteFilter(priorite)
        );
        return toResponseList(interventionRepository.findAll(spec));
    }

    public List<InterventionResponse> getInterventionsForCurrentUser(String email) {
        User technicien = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return toResponseList(interventionRepository.findByTechnicienId(technicien.getId()));
    }

    public InterventionResponse getIntervention(Long id) {
        Intervention intervention = findById(id);
        return toResponse(intervention,
                rapportInterventionRepository.existsByInterventionId(intervention.getId()),
                (int) photoInterventionRepository.countByInterventionId(intervention.getId()));
    }

    public InterventionResponse createIntervention(InterventionRequest request) {
        User technicien = resolveTechnicien(request.getTechnicienId());

        Intervention intervention = Intervention.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .dateIntervention(request.getDateIntervention())
                .statut(parseStatut(request.getStatut(), StatutIntervention.EN_ATTENTE))
                .priorite(parsePriorite(request.getPriorite(), PrioriteIntervention.NORMALE))
                .technicien(technicien)
                .build();

        intervention = interventionRepository.save(intervention);

        if (technicien != null) {
            notificationService.notifyAssignation(technicien, intervention.getId(), intervention.getTitre());
        }

        return toResponse(intervention, false, 0);
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
        intervention.setPriorite(parsePriorite(request.getPriorite(), intervention.getPriorite()));

        intervention = interventionRepository.save(intervention);

        boolean reassignee = technicien != null && !technicien.getId().equals(previousTechnicienId);
        if (reassignee) {
            notificationService.notifyAssignation(technicien, intervention.getId(), intervention.getTitre());
        }

        return toResponse(intervention,
                rapportInterventionRepository.existsByInterventionId(intervention.getId()),
                (int) photoInterventionRepository.countByInterventionId(intervention.getId()));
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

        return toResponse(intervention,
                rapportInterventionRepository.existsByInterventionId(intervention.getId()),
                (int) photoInterventionRepository.countByInterventionId(intervention.getId()));
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

    private PrioriteIntervention parsePriorite(String priorite, PrioriteIntervention fallback) {
        if (priorite == null || priorite.isBlank()) {
            return fallback;
        }
        return PrioriteIntervention.valueOf(priorite.toUpperCase());
    }

    private StatutIntervention parseStatutFilter(String statut) {
        if (statut == null || statut.isBlank()) {
            return null;
        }
        return StatutIntervention.valueOf(statut.toUpperCase());
    }

    private PrioriteIntervention parsePrioriteFilter(String priorite) {
        if (priorite == null || priorite.isBlank()) {
            return null;
        }
        return PrioriteIntervention.valueOf(priorite.toUpperCase());
    }

    private List<InterventionResponse> toResponseList(List<Intervention> interventions) {
        if (interventions.isEmpty()) {
            return List.of();
        }
        List<Long> ids = interventions.stream().map(Intervention::getId).toList();
        Set<Long> idsWithRapport = new HashSet<>(rapportInterventionRepository.findInterventionIdsWithRapport(ids));

        Map<Long, Long> photoCounts = new HashMap<>();
        for (PhotoInterventionRepository.InterventionPhotoCount count : photoInterventionRepository.countByInterventionIds(ids)) {
            photoCounts.put(count.getInterventionId(), count.getTotal());
        }

        return interventions.stream()
                .map(i -> toResponse(i, idsWithRapport.contains(i.getId()), photoCounts.getOrDefault(i.getId(), 0L).intValue()))
                .toList();
    }

    private InterventionResponse toResponse(Intervention intervention, boolean rapportDisponible, int nombrePhotos) {
        User technicien = intervention.getTechnicien();
        return new InterventionResponse(
                intervention.getId(),
                intervention.getTitre(),
                intervention.getDescription(),
                intervention.getDateIntervention(),
                intervention.getDateCreation(),
                intervention.getStatut().name(),
                intervention.getPriorite().name(),
                technicien != null ? technicien.getId() : null,
                technicien != null ? technicien.getNom() : null,
                technicien != null ? technicien.getPrenom() : null,
                rapportDisponible,
                nombrePhotos
        );
    }
}
