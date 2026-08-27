package com.motelmanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số CMND/CCCD không được để trống")
    @Size(max = 20, message = "Số CMND/CCCD không quá 20 ký tự")
    private String identityNumber;

    private LocalDate dateOfBirth;

    private String gender;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "(84|0[3|5|7|8|9])+([0-9]{8})\\b", message = "Số điện thoại không đúng định dạng")
    private String phone;

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String address;

    private String occupation;

    private Long userId; // optional linked user account
}
