package com.backend.backendjar.repository;


import com.backend.backendjar.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodRepository extends JpaRepository<Food, Long> {
}

