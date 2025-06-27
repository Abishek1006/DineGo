package com.backend.backendjar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TableUsageReportDTO {
    private Long tableId;
    private int tableNumber;
    private Long usageCount;
}
