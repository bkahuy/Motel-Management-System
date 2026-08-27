package com.motelmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {
    private Long id;
    private String fullName;
    private String identityNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String occupation;
    private Long userId;
    private String username;
    private Long currentRoomId;
    private String currentRoomNumber;
    private String currentBuildingName;
    private Long currentContractId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
