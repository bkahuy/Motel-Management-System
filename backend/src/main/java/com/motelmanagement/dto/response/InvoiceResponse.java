package com.motelmanagement.dto.response;

import com.motelmanagement.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private String invoiceCode;
    private Long contractId;
    private String contractCode;
    private Long roomId;
    private String roomNumber;
    private String buildingName;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private String billingMonth;
    private BigDecimal roomFee;
    private BigDecimal electricityFee;
    private BigDecimal waterFee;
    private BigDecimal serviceFee;
    private BigDecimal otherFee;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private String notes;
    private List<InvoiceItemResponse> items;
    private List<PaymentResponse> payments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
