package com.example.demo.repository;

import com.example.demo.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop30ByDestinataireIdOrderByDateCreationDesc(Long destinataireId);

    List<Notification> findByDestinataireIdAndLueFalse(Long destinataireId);
}
