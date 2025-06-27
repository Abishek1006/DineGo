package com.backend.backendjar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlySalesReportDTO {
    private int year;
    private int month;
    private Long totalGroups;
    private Double totalRevenue;
}
