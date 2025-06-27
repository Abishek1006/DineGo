package com.backend.backendjar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.backend.backendjar.dto.FoodSalesReportDTO;
import com.backend.backendjar.dto.MonthlySalesReportDTO;
import com.backend.backendjar.entity.DiningGroup;
import com.backend.backendjar.entity.Food;
import com.backend.backendjar.entity.OrderItem;

public interface OrderItemRepository extends CrudRepository<OrderItem, Long> {
    // Top-selling foods
    @Query("""
        SELECT new com.backend.backendjar.dto.FoodSalesReportDTO(
            f.id, f.name, SUM(oi.quantity), SUM(oi.quantity * f.price)
        )
        FROM OrderItem oi
        JOIN oi.food f
        JOIN oi.group dg
        WHERE dg.submitted = true
        GROUP BY f.id, f.name
        ORDER BY SUM(oi.quantity) DESC
    """)
    List<FoodSalesReportDTO> findTopSellingFoods();

    // Least-selling foods (including zero sales)
    @Query("""
        SELECT new com.backend.backendjar.dto.FoodSalesReportDTO(
            f.id, f.name, COALESCE(SUM(oi.quantity), 0), COALESCE(SUM(oi.quantity * f.price), 0)
        )
        FROM Food f
        LEFT JOIN OrderItem oi ON oi.food = f
        LEFT JOIN oi.group dg ON dg.submitted = true
        GROUP BY f.id, f.name
        ORDER BY COALESCE(SUM(oi.quantity), 0) ASC
    """)
    List<FoodSalesReportDTO> findLeastSellingFoods();
        
    // Monthly sales
    @Query("""
        SELECT new com.backend.backendjar.dto.MonthlySalesReportDTO(
            YEAR(dg.createdAt), MONTH(dg.createdAt), COUNT(DISTINCT dg.id), COALESCE(SUM(oi.quantity * f.price), 0)
        )
        FROM DiningGroup dg
        LEFT JOIN OrderItem oi ON oi.group = dg
        LEFT JOIN oi.food f
        WHERE dg.submitted = true
        GROUP BY YEAR(dg.createdAt), MONTH(dg.createdAt)
        ORDER BY YEAR(dg.createdAt) DESC, MONTH(dg.createdAt) DESC
    """)
    List<MonthlySalesReportDTO> findMonthlySales();
    
    List<OrderItem> findByGroup(DiningGroup group);
    Optional<OrderItem> findByGroupAndFood(DiningGroup group, Food food);
    void deleteByGroup(DiningGroup group);
    List<OrderItem> findByGroupOrderByIdAsc(DiningGroup group);
}
