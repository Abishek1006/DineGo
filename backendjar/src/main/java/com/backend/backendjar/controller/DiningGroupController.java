package com.backend.backendjar.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backendjar.dto.FoodOrderRequest;
import com.backend.backendjar.entity.DiningGroup;
import com.backend.backendjar.entity.OrderItem;
import com.backend.backendjar.service.DiningGroupService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class DiningGroupController {

    private final DiningGroupService service;

    @PostMapping("/create")
   @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<DiningGroup> createGroup(
            @RequestParam @NotNull Long tableId,
            @Valid @RequestBody List<@NotNull Long> seatIds) {

      //  log.info("Received request to create group for table: {} with seats: {}", tableId, seatIds);
        DiningGroup group = service.createGroup(tableId, seatIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(group);
    }

    // Single item endpoint (for your current frontend)
    @PostMapping("/{groupId}/add-item")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<OrderItem> addSingleItem(
            @PathVariable @NotNull Long groupId,
            @RequestParam @NotNull Long foodId,
            @RequestParam @Min(1) int quantity) {

        OrderItem createdItem = service.addItemToGroup(groupId, foodId, quantity);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    // Multiple items endpoint (existing)
    @PostMapping("/{groupId}/add-items")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<List<OrderItem>> addItems(
            @PathVariable @NotNull Long groupId,
            @Valid @RequestBody List<@Valid FoodOrderRequest> foodOrders) {

        List<OrderItem> createdItems = service.addMultipleItemsToGroup(groupId, foodOrders);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItems);
    }

    // Update/Edit item quantity
    @PutMapping("/{groupId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<OrderItem> updateItemQuantity(
            @PathVariable @NotNull Long groupId,
            @PathVariable @NotNull Long itemId,
            @RequestParam @Min(1) int quantity) {

        OrderItem updatedItem = service.updateItemQuantity(groupId, itemId, quantity);
        return ResponseEntity.ok(updatedItem);
    }

    // Remove item from group
    @DeleteMapping("/{groupId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<Void> removeItemFromGroup(
            @PathVariable @NotNull Long groupId,
            @PathVariable @NotNull Long itemId) {

        service.removeItemFromGroup(groupId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/submit")
   @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<DiningGroup> submitGroup(@PathVariable @NotNull Long groupId) {
       // log.info("Received request to submit group: {}", groupId);
        DiningGroup group = service.submitGroup(groupId);
        return ResponseEntity.ok(group);
    }

    @GetMapping("/{groupId}/items")
   @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<List<OrderItem>> getGroupItems(@PathVariable @NotNull Long groupId) {
      //  log.info("Received request to get items for group: {}", groupId);
        List<OrderItem> items = service.getItemsByGroup(groupId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/submitted")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<List<DiningGroup>> getSubmittedGroups() {
       // log.info("Received request to get all submitted groups");
        List<DiningGroup> groups = service.getSubmittedGroups();
        return ResponseEntity.ok(groups);
    }

    // Get unsubmitted groups (for editing)
    @GetMapping("/unsubmitted")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<List<DiningGroup>> getUnsubmittedGroups() {
        List<DiningGroup> groups = service.getUnsubmittedGroups();
        return ResponseEntity.ok(groups);
    }

    // Get all groups (both submitted and unsubmitted)
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<DiningGroup>> getAllGroups() {
        List<DiningGroup> groups = service.getAllGroups();
        return ResponseEntity.ok(groups);
    }

    // Get single group details
    @GetMapping("/{groupId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<DiningGroup> getGroupById(@PathVariable @NotNull Long groupId) {
        DiningGroup group = service.getGroupById(groupId);
        return ResponseEntity.ok(group);
    }

    @DeleteMapping("/{groupId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','WAITER')")
    public ResponseEntity<Void> deleteGroup(@PathVariable @NotNull Long groupId) {
        //log.info("Received request to delete group: {}", groupId);
        service.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }
}
