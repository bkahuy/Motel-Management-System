package com.motelmanagement.dto.response;

import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.enums.PaymentCycle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {
    private Long id;
    private String contractCode;
    private Long roomId;
    private String roomNumber;
    private Long buildingId;
    private String buildingName;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private String tenantIdentityNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal rentPrice;
    private BigDecimal deposit;
    private PaymentCycle paymentCycle;
    private ContractStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
