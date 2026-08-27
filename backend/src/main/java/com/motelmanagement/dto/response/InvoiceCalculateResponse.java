package com.motelmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceCalculateResponse {
    private Long contractId;
    private String contractCode;
    private String roomNumber;
    private String tenantName;
    private String billingMonth;

    private BigDecimal roomFee;

    private Integer electricityPrevious;
    private Integer electricityCurrent;
    private Integer electricityUsage;
    private BigDecimal electricityUnitPrice;
    private BigDecimal electricityFee;

    private Integer waterPrevious;
    private Integer waterCurrent;
    private Integer waterUsage;
    private BigDecimal waterUnitPrice;
    private BigDecimal waterFee;

    private BigDecimal serviceFee;
    private List<InvoiceItemResponse> serviceItems;

    private BigDecimal otherFee;
    private BigDecimal totalAmount;
}
