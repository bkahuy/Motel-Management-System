package com.motelmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceCalculateRequest {

    @NotNull(message = "Hợp đồng không được để trống")
    private Long contractId;

    @NotBlank(message = "Tháng tính tiền không được để trống")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Tháng tính tiền phải có định dạng YYYY-MM")
    private String billingMonth;

    private BigDecimal electricityUnitPrice;
    private BigDecimal waterUnitPrice;
    private BigDecimal otherFee;
}
