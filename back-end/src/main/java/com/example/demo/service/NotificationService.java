package com.example.demo.service;

import com.example.demo.dto.NotificationResponse;
import com.example.demo.entity.Notification;
import com.example.demo.entity.TypeNotification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String email) {
        User user = getUser(email);
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.computeIfAbsent(user.getId(), k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(user.getId(), emitter));
        emitter.onTimeout(() -> removeEmitter(user.getId(), emitter));
        emitter.onError(e -> removeEmitter(user.getId(), emitter));

        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (IOException e) {
            removeEmitter(user.getId(), emitter);
        }
        return emitter;
    }

    @Scheduled(fixedRate = 25000)
    public void heartbeat() {
        emitters.forEach((userId, list) -> {
            for (SseEmitter emitter : list) {
                try {
                    emitter.send(SseEmitter.event().comment("keep-alive"));
                } catch (IOException e) {
                    removeEmitter(userId, emitter);
                }
            }
        });
    }

    public List<NotificationResponse> getForCurrentUser(String email) {
        User user = getUser(email);
        return notificationRepository.findTop30ByDestinataireIdOrderByDateCreationDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public void markAsRead(Long id, String email) {
        User user = getUser(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        if (!notification.getDestinataire().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette notification");
        }

        notification.setLue(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String email) {
        User user = getUser(email);
        List<Notification> unread = notificationRepository.findByDestinataireIdAndLueFalse(user.getId());
        unread.forEach(n -> n.setLue(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteAllForUser(String email) {
        User user = getUser(email);
        notificationRepository.deleteByDestinataireId(user.getId());
    }

    public void notifyAssignation(User technicien, Long interventionId, String titre) {
        String message = "Nouvelle intervention assignée : " + titre;
        create(technicien, message, TypeNotification.ASSIGNATION, interventionId);
    }

    public void notifyTerminee(List<User> admins, Long interventionId, String titre, String technicienNomComplet) {
        String message = technicienNomComplet + " a terminé l'intervention : " + titre;
        admins.forEach(admin -> create(admin, message, TypeNotification.TERMINEE, interventionId));
    }

    private void create(User destinataire, String message, TypeNotification type, Long interventionId) {
        Notification notification = Notification.builder()
                .destinataire(destinataire)
                .message(message)
                .type(type)
                .interventionId(interventionId)
                .lue(false)
                .build();

        notification = notificationRepository.save(notification);
        push(destinataire.getId(), toResponse(notification));
    }

    private void push(Long userId, NotificationResponse payload) {
        List<SseEmitter> list = emitters.get(userId);
        if (list == null) {
            return;
        }
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(payload));
            } catch (IOException e) {
                removeEmitter(userId, emitter);
            }
        }
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(userId);
        if (list != null) {
            list.remove(emitter);
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getMessage(),
                n.getType().name(),
                n.getInterventionId(),
                n.isLue(),
                n.getDateCreation()
        );
    }
}
