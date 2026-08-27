package com.motelmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeterReadingResponse {
    private Long id;
    private Long contractId;
    private String contractCode;
    private Long roomId;
    private String roomNumber;
    private String buildingName;
    private String tenantName;
    private String readingMonth;
    private Integer electricityPrevious;
    private Integer electricityCurrent;
    private Integer electricityUsage;
    private Integer waterPrevious;
    private Integer waterCurrent;
    private Integer waterUsage;
    private LocalDate readingDate;
    private String notes;
    private LocalDateTime createdAt;
}
