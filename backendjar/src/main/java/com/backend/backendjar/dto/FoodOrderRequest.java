package com.backend.backendjar.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FoodOrderRequest {
    @NotNull
    private Long foodId;

    @Min(1)
    private int quantity;
}

