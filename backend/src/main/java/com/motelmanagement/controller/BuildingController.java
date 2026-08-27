package com.motelmanagement.controller;

import com.motelmanagement.dto.request.BuildingRequest;
import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.BuildingResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.service.BuildingService;
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
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
@Tag(name = "Buildings", description = "Quản lý tòa nhà / khu trọ")
public class BuildingController {

    private final BuildingService buildingService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tòa nhà có phân trang và tìm kiếm")
    public ResponseEntity<ApiResponse<PageResponse<BuildingResponse>>> getBuildings(
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<BuildingResponse> response = buildingService.getBuildings(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    @Operation(summary = "Lấy toàn bộ danh sách tòa nhà không phân trang")
    public ResponseEntity<ApiResponse<List<BuildingResponse>>> getAllBuildings() {
        List<BuildingResponse> response = buildingService.getAllBuildings();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết tòa nhà theo ID")
    public ResponseEntity<ApiResponse<BuildingResponse>> getBuildingById(@PathVariable Long id) {
        BuildingResponse response = buildingService.getBuildingById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo mới tòa nhà (Admin)")
    public ResponseEntity<ApiResponse<BuildingResponse>> createBuilding(@Valid @RequestBody BuildingRequest request) {
        BuildingResponse response = buildingService.createBuilding(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm tòa nhà thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin tòa nhà (Admin)")
    public ResponseEntity<ApiResponse<BuildingResponse>> updateBuilding(
            @PathVariable Long id,
            @Valid @RequestBody BuildingRequest request
    ) {
        BuildingResponse response = buildingService.updateBuilding(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tòa nhà thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa tòa nhà (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteBuilding(@PathVariable Long id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tòa nhà thành công", null));
    }
}
