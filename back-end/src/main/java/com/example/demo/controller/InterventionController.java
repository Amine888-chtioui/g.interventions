package com.example.demo.controller;

import com.example.demo.dto.InterventionResponse;
import com.example.demo.dto.PhotoInterventionResponse;
import com.example.demo.dto.RapportInterventionRequest;
import com.example.demo.dto.RapportInterventionResponse;
import com.example.demo.dto.StatutUpdateRequest;
import com.example.demo.service.InterventionService;
import com.example.demo.service.PhotoInterventionService;
import com.example.demo.service.RapportInterventionService;
import com.example.demo.service.RapportPdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/interventions")
@RequiredArgsConstructor
public class InterventionController {

    private final InterventionService interventionService;
    private final RapportInterventionService rapportInterventionService;
    private final PhotoInterventionService photoInterventionService;
    private final RapportPdfService rapportPdfService;

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

    @GetMapping("/{id}/rapport")
    public ResponseEntity<RapportInterventionResponse> getRapport(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(rapportInterventionService.getRapport(id, authentication.getName()));
    }

    @PostMapping("/{id}/rapport")
    public ResponseEntity<RapportInterventionResponse> createRapport(
            @PathVariable Long id,
            @RequestBody RapportInterventionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(rapportInterventionService.createRapport(id, request, authentication.getName()));
    }

    @PutMapping("/{id}/rapport")
    public ResponseEntity<RapportInterventionResponse> updateRapport(
            @PathVariable Long id,
            @RequestBody RapportInterventionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(rapportInterventionService.updateRapport(id, request, authentication.getName()));
    }

    @GetMapping("/{id}/rapport/pdf")
    public ResponseEntity<byte[]> getRapportPdf(@PathVariable Long id, Authentication authentication) {
        RapportInterventionResponse rapport = rapportInterventionService.getRapport(id, authentication.getName());

        List<RapportPdfService.RapportPhoto> photos = photoInterventionService.getPhotos(id, authentication.getName())
                .stream()
                .map(p -> {
                    PhotoInterventionService.PhotoFile file =
                            photoInterventionService.loadPhotoFile(id, p.getId(), authentication.getName());
                    return new RapportPdfService.RapportPhoto(file.resource(), p.getNomOriginal());
                })
                .toList();

        byte[] pdf = rapportPdfService.generateRapportPdf(rapport, photos);
        String filename = "rapport-intervention-" + id + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(pdf);
    }

    @GetMapping("/{id}/photos")
    public ResponseEntity<List<PhotoInterventionResponse>> getPhotos(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(photoInterventionService.getPhotos(id, authentication.getName()));
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<List<PhotoInterventionResponse>> uploadPhotos(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication) {
        return ResponseEntity.ok(photoInterventionService.uploadPhotos(id, files, authentication.getName()));
    }

    @GetMapping("/{id}/photos/{photoId}/fichier")
    public ResponseEntity<Resource> getPhotoFile(
            @PathVariable Long id, @PathVariable Long photoId, Authentication authentication) {
        PhotoInterventionService.PhotoFile photoFile =
                photoInterventionService.loadPhotoFile(id, photoId, authentication.getName());

        MediaType mediaType = photoFile.contentType() != null
                ? MediaType.parseMediaType(photoFile.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok().contentType(mediaType).body(photoFile.resource());
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @PathVariable Long id, @PathVariable Long photoId, Authentication authentication) {
        photoInterventionService.deletePhoto(id, photoId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
