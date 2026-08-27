package com.motelmanagement.dto.response;

import com.motelmanagement.enums.PaymentMethod;
import com.motelmanagement.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long invoiceId;
    private String invoiceCode;
    private String roomNumber;
    private String tenantName;
    private String billingMonth;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private LocalDateTime paymentDate;
    private String transactionCode;
    private PaymentStatus status;
    private String notes;
    private LocalDateTime createdAt;
}
