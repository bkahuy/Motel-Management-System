package com.motelmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomServiceAssignRequest {

    @NotNull(message = "Danh sách dịch vụ không được null")
    private Set<Long> serviceIds;
}
