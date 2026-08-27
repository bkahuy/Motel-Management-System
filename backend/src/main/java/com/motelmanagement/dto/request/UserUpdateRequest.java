package com.motelmanagement.dto.request;

import com.motelmanagement.enums.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private String password; // optional, only updated if provided

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    private String phone;

    private RoleName role;

    private Boolean active;
}
