package com.motelmanagement.controller;

import com.motelmanagement.dto.request.ServiceRequest;
import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.ServiceResponse;
import com.motelmanagement.service.ServiceService;
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
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Quản lý bảng giá dịch vụ (Điện, Nước, WiFi, Vệ sinh...)")
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    @Operation(summary = "Lấy danh sách dịch vụ có phân trang và tìm kiếm")
    public ResponseEntity<ApiResponse<PageResponse<ServiceResponse>>> getServices(
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        PageResponse<ServiceResponse> response = serviceService.getServices(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    @Operation(summary = "Lấy toàn bộ danh sách dịch vụ đang kích hoạt (active)")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllActiveServices() {
        List<ServiceResponse> response = serviceService.getAllActiveServices();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin dịch vụ theo ID")
    public ResponseEntity<ApiResponse<ServiceResponse>> getServiceById(@PathVariable Long id) {
        ServiceResponse response = serviceService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Tạo mới dịch vụ (Admin/Staff)")
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(@Valid @RequestBody ServiceRequest request) {
        ServiceResponse response = serviceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm dịch vụ mới thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Cập nhật thông tin dịch vụ (Admin/Staff)")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request
    ) {
        ServiceResponse response = serviceService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật dịch vụ thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Vô hiệu hóa dịch vụ (Admin/Staff)")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success("Vô hiệu hóa dịch vụ thành công", null));
    }
}
