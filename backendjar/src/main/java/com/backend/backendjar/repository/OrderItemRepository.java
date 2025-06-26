package com.backend.backendjar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.backendjar.entity.DiningGroup;
import com.backend.backendjar.entity.Food;
import com.backend.backendjar.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByGroup(DiningGroup group);
    Optional<OrderItem> findByGroupAndFood(DiningGroup group, Food food);
    void deleteByGroup(DiningGroup group);
     List<OrderItem> findByGroupOrderByIdAsc(DiningGroup group);
}
