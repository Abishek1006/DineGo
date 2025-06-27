package com.backend.backendjar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodSalesReportDTO {
    private Long id;
    private String name;
    private Long totalQuantity;
    private Double totalRevenue;
} 