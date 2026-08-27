package com.motelmanagement.dto.response;

import com.motelmanagement.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private Long buildingId;
    private String buildingName;
    private String roomNumber;
    private BigDecimal price;
    private BigDecimal area;
    private Integer maxOccupants;
    private BigDecimal deposit;
    private RoomStatus status;
    private String description;
    private List<ServiceResponse> services;
    private String currentTenantName;
    private String currentTenantPhone;
    private Long currentContractId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
