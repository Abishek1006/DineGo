package com.backend.backendjar.controller;

import com.backend.backendjar.entity.Food;
import com.backend.backendjar.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodRepository foodRepo;

    @GetMapping
    public List<Food> getAllFoods() {
        return foodRepo.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Food> addFood(@RequestBody Food food) {
        return ResponseEntity.ok(foodRepo.save(food));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Food> updateFood(@PathVariable Long id, @RequestBody Food food) {
        Food existing = foodRepo.findById(id).orElseThrow();
        existing.setName(food.getName());
        existing.setPrice(food.getPrice());
        return ResponseEntity.ok(foodRepo.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteFood(@PathVariable Long id) {
        foodRepo.deleteById(id);
        return ResponseEntity.ok("Food deleted");
    }
}

