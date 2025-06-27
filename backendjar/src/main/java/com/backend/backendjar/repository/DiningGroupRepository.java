package com.backend.backendjar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.backend.backendjar.dto.TableUsageReportDTO;
import com.backend.backendjar.entity.DiningGroup;

public interface DiningGroupRepository extends CrudRepository<DiningGroup, Long> {
    List<DiningGroup> findBySubmitted(boolean submitted);
    
    List<DiningGroup> findBySubmittedAndPaid(boolean submitted, boolean paid);
    
    // Table usage report
    @Query("""
        SELECT new com.backend.backendjar.dto.TableUsageReportDTO(
            rt.id, rt.tableNumber, COUNT(dg.id)
        )
        FROM RestaurantTable rt
        LEFT JOIN DiningGroup dg ON dg.table = rt
        WHERE dg.submitted = true
        GROUP BY rt.id, rt.tableNumber
        ORDER BY rt.tableNumber
    """)
    List<TableUsageReportDTO> findTableUsage();
    
    List<DiningGroup> findBySubmittedOrderByCreatedAtDesc(boolean submitted);
    List<DiningGroup> findAllByOrderByCreatedAtDesc();
    List<DiningGroup> findByPaid(boolean paid);
}
