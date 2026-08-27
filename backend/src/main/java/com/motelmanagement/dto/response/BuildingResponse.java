package com.motelmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildingResponse {
    private Long id;
    private String name;
    private String address;
    private String description;
    private Integer totalFloors;
    private int totalRooms;
    private int availableRooms;
    private int occupiedRooms;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
