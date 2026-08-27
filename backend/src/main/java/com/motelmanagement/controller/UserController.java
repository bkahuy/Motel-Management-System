package com.motelmanagement.controller;

import com.motelmanagement.dto.request.UserCreateRequest;
import com.motelmanagement.dto.request.UserUpdateRequest;
import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.UserResponse;
import com.motelmanagement.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Users", description = "Quản lý tài khoản người dùng hệ thống (Admin only)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lấy danh sách người dùng có phân trang và tìm kiếm (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<UserResponse> response = userService.getUsers(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    @Operation(summary = "Lấy toàn bộ danh sách người dùng không phân trang (Admin)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> response = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết người dùng theo ID (Admin)")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Tạo mới người dùng (Admin)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tài khoản người dùng thành công", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin người dùng (Admin)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tài khoản người dùng thành công", response));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Khóa hoặc mở khóa tài khoản người dùng (Admin)")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Thay đổi trạng thái tài khoản thành công", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tài khoản người dùng (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài khoản thành công", null));
    }
}
