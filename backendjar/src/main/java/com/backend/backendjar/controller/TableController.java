package com.backend.backendjar.controller;

import com.backend.backendjar.entity.RestaurantTable;
import com.backend.backendjar.repository.RestaurantTableRepository;
import com.backend.backendjar.dto.TableResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {
    private final RestaurantTableRepository tableRepo;

    @GetMapping
    public List<TableResponse> getAllTablesWithSeats() {
        return tableRepo.findAll().stream().map(table ->
            TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .seats(table.getSeats() == null ? List.of() : table.getSeats().stream().map(seat ->
                    TableResponse.SeatResponse.builder()
                        .id(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .build()
                ).collect(Collectors.toList()))
                .build()
        ).collect(Collectors.toList());
    }
}
