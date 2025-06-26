package com.backend.backendjar.repository;

import com.backend.backendjar.entity.DiningGroup;
import com.backend.backendjar.entity.GroupSeat;
import com.backend.backendjar.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
public interface GroupSeatRepository extends JpaRepository<GroupSeat, Long> {
    boolean existsBySeatAndGroupSubmitted(Seat seat, boolean submitted);
    void deleteByGroup(DiningGroup group);
}