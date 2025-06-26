package com.backend.backendjar.repository;
import com.backend.backendjar.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByTableId(Long tableId);
}
