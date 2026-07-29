package com.example.demo.repository;

import com.example.demo.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface InterventionRepository extends JpaRepository<Intervention, Long>, JpaSpecificationExecutor<Intervention> {
    List<Intervention> findByTechnicienId(Long technicienId);
}
