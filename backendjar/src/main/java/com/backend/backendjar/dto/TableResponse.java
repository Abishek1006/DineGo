package com.backend.backendjar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableResponse {
    private Long id;
    private int tableNumber;
    private java.util.List<SeatResponse> seats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatResponse {
        private Long id;
        private String seatNumber;
    }
}