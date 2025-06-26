package com.backend.backendjar.service;


import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.backend.backendjar.repository.*;
import org.springframework.stereotype.Service;
import com.backend.backendjar.dto.FoodOrderRequest;
import com.backend.backendjar.entity.DiningGroup;
import com.backend.backendjar.entity.Food;
import com.backend.backendjar.entity.GroupSeat;
import com.backend.backendjar.entity.OrderItem;
import com.backend.backendjar.entity.RestaurantTable;
import com.backend.backendjar.entity.Seat;
import com.backend.backendjar.exception.InvalidOperationException;
import com.backend.backendjar.exception.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiningGroupService {
    private final DiningGroupRepository groupRepo;
    private final RestaurantTableRepository tableRepo;
    private final SeatRepository seatRepo;
    private final GroupSeatRepository groupSeatRepo;
    private final OrderItemRepository orderItemRepo;
    private final FoodRepository foodRepo;

    @Transactional
    public DiningGroup createGroup(Long tableId, List<Long> seatIds) {
        try {
            log.info("Creating dining group for table ID: {} with seat IDs: {}", tableId, seatIds);

            // Validation
            if (tableId == null) {
                throw new ValidationException("Table ID cannot be null");
            }
            if (seatIds == null || seatIds.isEmpty()) {
                throw new ValidationException("Seat IDs cannot be null or empty");
            }
            if (seatIds.size() > 10) { // Assuming max 10 seats per group
                throw new ValidationException("Cannot create group with more than 10 seats");
            }

            // Check if table exists
            RestaurantTable table = tableRepo.findById(tableId)
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found with ID: " + tableId));

            // Check if all seats exist and belong to the table
            List<Seat> seats = seatRepo.findAllById(seatIds);
            if (seats.size() != seatIds.size()) {
                throw new ResourceNotFoundException("One or more seats not found");
            }

            // Validate seats belong to the table
            for (Seat seat : seats) {
                if (!seat.getTable().getId().equals(tableId)) {
                    throw new ValidationException("Seat " + seat.getSeatNumber() + " does not belong to table " + table.getTableNumber());
                }
            }

            // Check if any seats are already occupied in an active group
            for (Seat seat : seats) {
                boolean isOccupied = groupSeatRepo.existsBySeatAndGroupSubmitted(seat, false);
                if (isOccupied) {
                    throw new InvalidOperationException("Seat " + seat.getSeatNumber() + " is already occupied by another active group");
                }
            }

            // Create group name
            String seatLabel = seats.stream()
                    .map(Seat::getSeatNumber)
                    .sorted()
                    .reduce("", String::concat);
            String groupName = "T" + table.getTableNumber() + "-G" +
                    UUID.randomUUID().toString().substring(0, 4) + "-" + seatLabel;

            // Create dining group
            DiningGroup group = DiningGroup.builder()
                    .groupName(groupName)
                    .submitted(false)
                    .createdAt(new Date())
                    .table(table)
                    .build();

            group = groupRepo.save(group);
            log.info("Created dining group with ID: {} and name: {}", group.getId(), group.getGroupName());

            // Create group-seat associations
            for (Seat seat : seats) {
                GroupSeat gs = GroupSeat.builder()
                        .group(group)
                        .seat(seat)
                        .build();
                groupSeatRepo.save(gs);
            }

            log.info("Successfully created dining group: {}", group.getGroupName());
            return group;

        } catch (Exception e) {
            log.error("Error creating dining group for table ID: {} with seat IDs: {}", tableId, seatIds, e);
            throw e;
        }
    }
    @Transactional
    public List<OrderItem> addMultipleItemsToGroup(Long groupId, List<FoodOrderRequest> foodOrders) {
        List<OrderItem> items = new ArrayList<>();
        for (FoodOrderRequest order : foodOrders) {
            OrderItem item = addItemToGroup(groupId, order.getFoodId(), order.getQuantity());
            items.add(item);
        }
        return items;
    }


    @Transactional
    public OrderItem addItemToGroup(Long groupId, Long foodId, int quantity) {
        try {
            log.info("Adding item to group ID: {}, food ID: {}, quantity: {}", groupId, foodId, quantity);

            // Validation
            if (groupId == null) {
                throw new ValidationException("Group ID cannot be null");
            }
            if (foodId == null) {
                throw new ValidationException("Food ID cannot be null");
            }
            if (quantity <= 0) {
                throw new ValidationException("Quantity must be greater than 0");
            }
            if (quantity > 50) { // Assuming max 50 items per order
                throw new ValidationException("Quantity cannot exceed 50 items");
            }

            // Check if group exists
            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));

            // Check if group is already submitted
            if (group.isSubmitted()) {
                throw new InvalidOperationException("Cannot add items to a submitted group");
            }

            // Check if food exists and is available
            Food food = foodRepo.findById(foodId)
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + foodId));


            // Check if item already exists in group, update quantity if it does
            Optional<OrderItem> existingItem = orderItemRepo.findByGroupAndFood(group, food);
            if (existingItem.isPresent()) {
                OrderItem item = existingItem.get();
                int newQuantity = item.getQuantity() + quantity;
                if (newQuantity > 50) {
                    throw new ValidationException("Total quantity for this item would exceed 50");
                }
                item.setQuantity(newQuantity);
                log.info("Updated existing order item quantity to: {}", newQuantity);
                return orderItemRepo.save(item);
            }

            // Create new order item
            OrderItem item = OrderItem.builder()
                    .group(group)
                    .food(food)
                    .quantity(quantity)
                    .build();

            OrderItem savedItem = orderItemRepo.save(item);
            log.info("Successfully added item to group: {}", savedItem.getId());
            return savedItem;

        } catch (Exception e) {
            log.error("Error adding item to group ID: {}, food ID: {}, quantity: {}", groupId, foodId, quantity, e);
            throw e;
        }
    }

    @Transactional
    public DiningGroup submitGroup(Long groupId) {
        try {
            log.info("Submitting group ID: {}", groupId);

            if (groupId == null) {
                throw new ValidationException("Group ID cannot be null");
            }

            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));

            if (group.isSubmitted()) {
                throw new InvalidOperationException("Group is already submitted");
            }

            List<OrderItem> items = orderItemRepo.findByGroup(group);
            if (items.isEmpty()) {
                throw new InvalidOperationException("Cannot submit group without any items");
            }

            // ❌ Removed food availability check
            // ❌ Removed group.setSubmittedAt(...)

            group.setSubmitted(true);

            DiningGroup savedGroup = groupRepo.save(group);
            log.info("Successfully submitted group: {}", group.getGroupName());
            return savedGroup;

        } catch (Exception e) {
            log.error("Error submitting group ID: {}", groupId, e);
            throw e;
        }
    }


    public List<OrderItem> getItemsByGroup(Long groupId) {
        try {
            log.info("Retrieving items for group ID: {}", groupId);

            // Validation
            if (groupId == null) {
                throw new ValidationException("Group ID cannot be null");
            }

            // Check if group exists
            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));

            List<OrderItem> items = orderItemRepo.findByGroup(group);
            log.info("Retrieved {} items for group ID: {}", items.size(), groupId);
            return items;

        } catch (Exception e) {
            log.error("Error retrieving items for group ID: {}", groupId, e);
            throw e;
        }
    }

    public List<DiningGroup> getSubmittedGroups() {
        try {
            log.info("Retrieving all submitted groups");

            List<DiningGroup> submittedGroups = groupRepo.findBySubmitted(true);
            log.info("Retrieved {} submitted groups", submittedGroups.size());
            return submittedGroups;

        } catch (Exception e) {
            log.error("Error retrieving submitted groups", e);
            throw new RuntimeException("Error retrieving submitted groups", e);
        }
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        try {
            log.info("Deleting group ID: {}", groupId);

            if (groupId == null) {
                throw new ValidationException("Group ID cannot be null");
            }

            // Check if group exists
            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));

            // Check if group is already submitted - FIX THE ERROR MESSAGE
            if (group.isSubmitted()) {
                throw new InvalidOperationException("Cannot delete a submitted group");
            }

            // Delete associated order items and group seats
            orderItemRepo.deleteByGroup(group);
            groupSeatRepo.deleteByGroup(group);
            groupRepo.delete(group);

            log.info("Successfully deleted group: {}", group.getGroupName());

        } catch (Exception e) {
            log.error("Error deleting group ID: {}", groupId, e);
            throw e;
        }
    }
    // Add these methods to your existing DiningGroupService class

    @Transactional
    public OrderItem updateItemQuantity(Long groupId, Long itemId, int quantity) {
        try {
            log.info("Updating item quantity - Group ID: {}, Item ID: {}, New Quantity: {}", groupId, itemId, quantity);

            if (groupId == null || itemId == null) {
                throw new ValidationException("Group ID and Item ID cannot be null");
            }
            if (quantity <= 0) {
                throw new ValidationException("Quantity must be greater than 0");
            }
            if (quantity > 50) {
                throw new ValidationException("Quantity cannot exceed 50 items");
            }

            // Check if group exists and is not submitted
            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));

            if (group.isSubmitted()) {
                throw new InvalidOperationException("Cannot edit items in a submitted group");
            }

            // Find the order item
            OrderItem item = orderItemRepo.findById(itemId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order item not found with ID: " + itemId));

            // Verify the item belongs to the group
            if (!item.getGroup().getId().equals(groupId)) {
                throw new InvalidOperationException("Item does not belong to the specified group");
            }

            item.setQuantity(quantity);
            OrderItem updatedItem = orderItemRepo.save(item);

            log.info("Successfully updated item quantity");
            return updatedItem;

        } catch (Exception e) {
            log.error("Error updating item quantity - Group ID: {}, Item ID: {}", groupId, itemId, e);
            throw e;
        }
    }

    @Transactional
    public void removeItemFromGroup(Long groupId, Long itemId) {
        try {
            log.info("Removing item from group - Group ID: {}, Item ID: {}", groupId, itemId);

            if (groupId == null || itemId == null) {
                throw new ValidationException("Group ID and Item ID cannot be null");
            }

            // Check if group exists and is not submitted
            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));

            if (group.isSubmitted()) {
                throw new InvalidOperationException("Cannot remove items from a submitted group");
            }

            // Find the order item
            OrderItem item = orderItemRepo.findById(itemId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order item not found with ID: " + itemId));

            // Verify the item belongs to the group
            if (!item.getGroup().getId().equals(groupId)) {
                throw new InvalidOperationException("Item does not belong to the specified group");
            }

            orderItemRepo.delete(item);
            log.info("Successfully removed item from group");

        } catch (Exception e) {
            log.error("Error removing item from group - Group ID: {}, Item ID: {}", groupId, itemId, e);
            throw e;
        }
    }

    public List<DiningGroup> getUnsubmittedGroups() {
        try {
            log.info("Retrieving all unsubmitted groups");

            List<DiningGroup> unsubmittedGroups = groupRepo.findBySubmitted(false);
            log.info("Retrieved {} unsubmitted groups", unsubmittedGroups.size());
            return unsubmittedGroups;

        } catch (Exception e) {
            log.error("Error retrieving unsubmitted groups", e);
            throw new RuntimeException("Error retrieving unsubmitted groups", e);
        }
    }

    public List<DiningGroup> getAllGroups() {
        try {
            log.info("Retrieving all groups");

            List<DiningGroup> allGroups = groupRepo.findAll();
            log.info("Retrieved {} total groups", allGroups.size());
            return allGroups;

        } catch (Exception e) {
            log.error("Error retrieving all groups", e);
            throw new RuntimeException("Error retrieving all groups", e);
        }
    }

    public DiningGroup getGroupById(Long groupId) {
        try {
            log.info("Retrieving group by ID: {}", groupId);

            if (groupId == null) {
                throw new ValidationException("Group ID cannot be null");
            }

            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));

            log.info("Retrieved group: {}", group.getGroupName());
            return group;

        } catch (Exception e) {
            log.error("Error retrieving group by ID: {}", groupId, e);
            throw e;
        }
    }


    @Transactional
    public List<OrderItem> addItemsFlexible(Long groupId, List<FoodOrderRequest> foodOrders) {
        try {
            log.info("Adding {} items to group ID: {}", foodOrders.size(), groupId);
            
            if (foodOrders == null || foodOrders.isEmpty()) {
                throw new ValidationException("Food orders list cannot be null or empty");
            }
            
            // Validate group exists and is not submitted
            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));
            
            if (group.isSubmitted()) {
                throw new InvalidOperationException("Cannot add items to a submitted group");
            }
            
            List<OrderItem> result = new ArrayList<>();
            
            // Process each food order
            for (FoodOrderRequest order : foodOrders) {
                OrderItem item = addItemToGroup(groupId, order.getFoodId(), order.getQuantity());
                result.add(item);
            }
            
            log.info("Successfully added {} items to group ID: {}", result.size(), groupId);
            return result;
            
        } catch (Exception e) {
            log.error("Error adding items to group ID: {}", groupId, e);
            throw e;
        }
    }

    public List<DiningGroup> getPaidGroups() {
        try {
            log.info("Retrieving all paid groups");
            List<DiningGroup> paidGroups = groupRepo.findByPaid(true);
            log.info("Retrieved {} paid groups", paidGroups.size());
            return paidGroups;
        } catch (Exception e) {
            log.error("Error retrieving paid groups", e);
            throw new RuntimeException("Error retrieving paid groups", e);
        }
    }

    public List<DiningGroup> getUnpaidGroups() {
        try {
            log.info("Retrieving all unpaid groups");
            List<DiningGroup> unpaidGroups = groupRepo.findByPaid(false);
            log.info("Retrieved {} unpaid groups", unpaidGroups.size());
            return unpaidGroups;
        } catch (Exception e) {
            log.error("Error retrieving unpaid groups", e);
            throw new RuntimeException("Error retrieving unpaid groups", e);
        }
    }

    @Transactional
    public DiningGroup markGroupAsPaid(Long groupId) {
        try {
            log.info("Marking group as paid: {}", groupId);
            if (groupId == null) {
                throw new ValidationException("Group ID cannot be null");
            }
            DiningGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dining group not found with ID: " + groupId));
            if (!group.isSubmitted()) {
                throw new InvalidOperationException("Cannot mark an unsubmitted group as paid");
            }
            if (group.isPaid()) {
                throw new InvalidOperationException("Group is already marked as paid");
            }
            group.setPaid(true);
            DiningGroup savedGroup = groupRepo.save(group);
            log.info("Group {} marked as paid", groupId);
            return savedGroup;
        } catch (Exception e) {
            log.error("Error marking group as paid: {}", groupId, e);
            throw e;
        }
    }
}
