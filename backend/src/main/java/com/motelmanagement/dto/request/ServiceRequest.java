package com.motelmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequest {

    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Size(max = 100, message = "Tên dịch vụ không quá 100 ký tự")
    private String name;

    @NotNull(message = "Đơn giá không được để trống")
    @PositiveOrZero(message = "Đơn giá phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Size(max = 50, message = "Đơn vị tính không quá 50 ký tự")
    private String unit;

    private String description;

    private Boolean active;
}
