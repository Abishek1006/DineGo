package com.backend.backendjar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.backendjar.entity.DiningGroup;

public interface DiningGroupRepository extends JpaRepository<DiningGroup, Long> {
    List<DiningGroup> findBySubmitted(boolean submitted);
    List<DiningGroup> findBySubmittedOrderByCreatedAtDesc(boolean submitted);
    List<DiningGroup> findAllByOrderByCreatedAtDesc();
    List<DiningGroup> findByPaid(boolean paid);
    List<DiningGroup> findBySubmittedAndPaid(boolean submitted, boolean paid);
}
