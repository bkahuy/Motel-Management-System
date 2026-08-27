package com.motelmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuildingRequest {

    @NotBlank(message = "Tên tòa nhà/khu trọ không được để trống")
    @Size(max = 100, message = "Tên tòa nhà không quá 100 ký tự")
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 255, message = "Địa chỉ không quá 255 ký tự")
    private String address;

    private String description;

    @Positive(message = "Số tầng phải lớn hơn 0")
    private Integer totalFloors;
}
