package com.motelmanagement.controller;

import com.motelmanagement.dto.request.TenantRequest;
import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.TenantResponse;
import com.motelmanagement.service.TenantService;
import com.motelmanagement.security.UserPrincipal;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Quản lý khách thuê phòng")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin cá nhân của người dùng / khách thuê đang đăng nhập")
    public ResponseEntity<ApiResponse<TenantResponse>> getMyProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        TenantResponse response = tenantService.getMyProfile(currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật thông tin cá nhân của người dùng / khách thuê đang đăng nhập")
    public ResponseEntity<ApiResponse<TenantResponse>> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody TenantRequest request
    ) {
        TenantResponse response = tenantService.updateMyProfile(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin cá nhân thành công", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy danh sách khách thuê có phân trang và tìm kiếm (Admin/Staff)")
    public ResponseEntity<ApiResponse<PageResponse<TenantResponse>>> getTenants(
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<TenantResponse> response = tenantService.getTenants(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy toàn bộ danh sách khách thuê không phân trang")
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getAllTenants() {
        List<TenantResponse> response = tenantService.getAllTenants();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy chi tiết khách thuê theo ID")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenantById(@PathVariable Long id) {
        TenantResponse response = tenantService.getTenantById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Tạo mới thông tin khách thuê (Admin/Staff)")
    public ResponseEntity<ApiResponse<TenantResponse>> createTenant(@Valid @RequestBody TenantRequest request) {
        TenantResponse response = tenantService.createTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm khách thuê thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Cập nhật thông tin khách thuê (Admin/Staff)")
    public ResponseEntity<ApiResponse<TenantResponse>> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody TenantRequest request
    ) {
        TenantResponse response = tenantService.updateTenant(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin khách thuê thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Xóa thông tin khách thuê (Admin/Staff)")
    public ResponseEntity<ApiResponse<Void>> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa khách thuê thành công", null));
    }
}
