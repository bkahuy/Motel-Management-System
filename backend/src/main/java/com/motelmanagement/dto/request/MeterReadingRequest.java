package com.motelmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeterReadingRequest {

    @NotNull(message = "Hợp đồng không được để trống")
    private Long contractId;

    @NotBlank(message = "Tháng ghi chỉ số không được để trống")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Tháng ghi phải có định dạng YYYY-MM")
    private String readingMonth;

    @NotNull(message = "Chỉ số điện cũ không được để trống")
    @PositiveOrZero(message = "Chỉ số điện cũ phải lớn hơn hoặc bằng 0")
    private Integer electricityPrevious;

    @NotNull(message = "Chỉ số điện mới không được để trống")
    @PositiveOrZero(message = "Chỉ số điện mới phải lớn hơn hoặc bằng 0")
    private Integer electricityCurrent;

    @NotNull(message = "Chỉ số nước cũ không được để trống")
    @PositiveOrZero(message = "Chỉ số nước cũ phải lớn hơn hoặc bằng 0")
    private Integer waterPrevious;

    @NotNull(message = "Chỉ số nước mới không được để trống")
    @PositiveOrZero(message = "Chỉ số nước mới phải lớn hơn hoặc bằng 0")
    private Integer waterCurrent;

    @NotNull(message = "Ngày ghi không được để trống")
    private LocalDate readingDate;

    private String notes;
}
