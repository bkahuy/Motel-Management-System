package com.motelmanagement.dto.request;

import com.motelmanagement.enums.RoomStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {

    @NotNull(message = "Tòa nhà không được để trống")
    private Long buildingId;

    @NotBlank(message = "Số phòng không được để trống")
    @Size(max = 50, message = "Số phòng không quá 50 ký tự")
    private String roomNumber;

    @NotNull(message = "Giá thuê không được để trống")
    @Positive(message = "Giá thuê phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "Diện tích không được để trống")
    @Positive(message = "Diện tích phải lớn hơn 0")
    private BigDecimal area;

    @NotNull(message = "Số người tối đa không được để trống")
    @Positive(message = "Số người tối đa phải lớn hơn 0")
    private Integer maxOccupants;

    @NotNull(message = "Tiền cọc không được để trống")
    @PositiveOrZero(message = "Tiền cọc phải lớn hơn hoặc bằng 0")
    private BigDecimal deposit;

    private RoomStatus status;

    private String description;

    private Set<Long> serviceIds;
}
