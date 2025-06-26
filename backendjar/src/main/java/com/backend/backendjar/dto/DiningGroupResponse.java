package com.backend.backendjar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiningGroupResponse {
    private Long id;
    private String groupName;
    private boolean submitted;
    private Date createdAt;
    private TableResponse table;
}