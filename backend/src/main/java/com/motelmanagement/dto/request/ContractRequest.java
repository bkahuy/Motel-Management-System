package com.motelmanagement.dto.request;

import com.motelmanagement.enums.PaymentCycle;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractRequest {

    @NotNull(message = "Phòng không được để trống")
    private Long roomId;

    @NotNull(message = "Khách thuê không được để trống")
    private Long tenantId;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @NotNull(message = "Giá thuê không được để trống")
    @Positive(message = "Giá thuê phải lớn hơn 0")
    private BigDecimal rentPrice;

    @NotNull(message = "Tiền cọc không được để trống")
    @PositiveOrZero(message = "Tiền cọc phải lớn hơn hoặc bằng 0")
    private BigDecimal deposit;

    @NotNull(message = "Kỳ thanh toán không được để trống")
    private PaymentCycle paymentCycle;

    private String notes;
}
