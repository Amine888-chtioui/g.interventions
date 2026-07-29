package com.example.demo.service;

import com.example.demo.dto.PhotoInterventionResponse;
import com.example.demo.entity.Intervention;
import com.example.demo.entity.PhotoIntervention;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.InterventionRepository;
import com.example.demo.repository.PhotoInterventionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoInterventionService {

    private final PhotoInterventionRepository photoInterventionRepository;
    private final InterventionRepository interventionRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<PhotoInterventionResponse> getPhotos(Long interventionId, String currentUserEmail) {
        Intervention intervention = findIntervention(interventionId);
        User currentUser = findUser(currentUserEmail);
        checkAccesLecture(intervention, currentUser);

        return photoInterventionRepository.findByInterventionId(interventionId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PhotoInterventionResponse> uploadPhotos(Long interventionId, List<MultipartFile> files, String currentUserEmail) {
        Intervention intervention = findIntervention(interventionId);
        User currentUser = findUser(currentUserEmail);
        checkTechnicienAssigne(intervention, currentUser);

        if (files == null || files.isEmpty()) {
            throw new RuntimeException("Aucun fichier fourni");
        }

        Path interventionDir = Paths.get(uploadDir, "interventions", String.valueOf(interventionId));
        try {
            Files.createDirectories(interventionDir);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier de stockage des photos");
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                throw new RuntimeException("Un des fichiers envoyés est vide");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Seuls les fichiers image sont autorisés");
            }

            String nomStocke = UUID.randomUUID() + extractExtension(file.getOriginalFilename());
            Path destination = interventionDir.resolve(nomStocke);

            try {
                Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l'enregistrement du fichier " + file.getOriginalFilename());
            }

            String cheminRelatif = Paths.get("interventions", String.valueOf(interventionId), nomStocke)
                    .toString().replace("\\", "/");

            PhotoIntervention photo = PhotoIntervention.builder()
                    .intervention(intervention)
                    .cheminFichier(cheminRelatif)
                    .nomOriginal(file.getOriginalFilename())
                    .contentType(contentType)
                    .build();

            photoInterventionRepository.save(photo);
        }

        return getPhotos(interventionId, currentUserEmail);
    }

    public void deletePhoto(Long interventionId, Long photoId, String currentUserEmail) {
        Intervention intervention = findIntervention(interventionId);
        User currentUser = findUser(currentUserEmail);
        checkTechnicienAssigne(intervention, currentUser);

        PhotoIntervention photo = findPhoto(interventionId, photoId);

        try {
            Files.deleteIfExists(Paths.get(uploadDir).resolve(photo.getCheminFichier()));
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression du fichier sur le serveur");
        }

        photoInterventionRepository.delete(photo);
    }

    public PhotoFile loadPhotoFile(Long interventionId, Long photoId, String currentUserEmail) {
        Intervention intervention = findIntervention(interventionId);
        User currentUser = findUser(currentUserEmail);
        checkAccesLecture(intervention, currentUser);

        PhotoIntervention photo = findPhoto(interventionId, photoId);
        Resource resource = new FileSystemResource(Paths.get(uploadDir).resolve(photo.getCheminFichier()));

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Fichier introuvable sur le serveur");
        }

        return new PhotoFile(resource, photo.getContentType());
    }

    private void checkAccesLecture(Intervention intervention, User currentUser) {
        boolean isAssignedTechnicien = intervention.getTechnicien() != null
                && intervention.getTechnicien().getId().equals(currentUser.getId());

        if (currentUser.getRole() != Role.ADMIN && !isAssignedTechnicien) {
            throw new RuntimeException("Vous n'êtes pas autorisé à consulter les photos de cette intervention");
        }
    }

    private void checkTechnicienAssigne(Intervention intervention, User currentUser) {
        boolean isAssignedTechnicien = intervention.getTechnicien() != null
                && intervention.getTechnicien().getId().equals(currentUser.getId());

        if (!isAssignedTechnicien) {
            throw new RuntimeException("Vous n'êtes pas autorisé à gérer les photos de cette intervention");
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

    private PhotoIntervention findPhoto(Long interventionId, Long photoId) {
        PhotoIntervention photo = photoInterventionRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo non trouvée"));

        if (!photo.getIntervention().getId().equals(interventionId)) {
            throw new RuntimeException("Cette photo n'appartient pas à cette intervention");
        }
        return photo;
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == originalFilename.length() - 1) {
            return "";
        }
        String extension = originalFilename.substring(dotIndex + 1).replaceAll("[^a-zA-Z0-9]", "");
        return extension.isEmpty() ? "" : "." + extension;
    }

    private PhotoInterventionResponse toResponse(PhotoIntervention photo) {
        return new PhotoInterventionResponse(
                photo.getId(),
                photo.getIntervention().getId(),
                photo.getNomOriginal(),
                photo.getDateAjout()
        );
    }

    public record PhotoFile(Resource resource, String contentType) {
    }
}
