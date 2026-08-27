package com.motelmanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceCreateRequest {

    @NotNull(message = "Hợp đồng không được để trống")
    private Long contractId;

    @NotBlank(message = "Tháng tính tiền không được để trống")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Tháng tính tiền phải có định dạng YYYY-MM")
    private String billingMonth;

    @NotNull(message = "Hạn thanh toán không được để trống")
    private LocalDate dueDate;

    @Positive(message = "Đơn giá điện phải lớn hơn 0")
    private BigDecimal electricityUnitPrice; // optional override, otherwise taken from service/default

    @Positive(message = "Đơn giá nước phải lớn hơn 0")
    private BigDecimal waterUnitPrice; // optional override, otherwise taken from service/default

    private BigDecimal otherFee;

    private String otherFeeDescription;

    private String notes;
}
