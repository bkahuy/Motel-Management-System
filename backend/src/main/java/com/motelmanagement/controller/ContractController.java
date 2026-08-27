package com.motelmanagement.controller;

import com.motelmanagement.dto.request.ContractRequest;
import com.motelmanagement.dto.request.TerminateContractRequest;
import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.ContractResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.ContractService;
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
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@Tag(name = "Contracts", description = "Quản lý hợp đồng thuê phòng")
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    @Operation(summary = "Lấy danh sách hợp đồng có phân trang, tìm kiếm và lọc")
    public ResponseEntity<ApiResponse<PageResponse<ContractResponse>>> getContracts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) ContractStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<ContractResponse> response = contractService.getContracts(
                search, roomId, tenantId, buildingId, status, currentUser, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy danh sách các hợp đồng đang hoạt động (ACTIVE)")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getActiveContracts() {
        List<ContractResponse> response = contractService.getActiveContracts();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết hợp đồng theo ID")
    public ResponseEntity<ApiResponse<ContractResponse>> getContractById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ContractResponse response = contractService.getContractById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Tạo hợp đồng thuê mới (Admin/Staff)")
    public ResponseEntity<ApiResponse<ContractResponse>> createContract(@Valid @RequestBody ContractRequest request) {
        ContractResponse response = contractService.createContract(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo hợp đồng thuê mới thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Cập nhật thông tin hợp đồng (Admin/Staff)")
    public ResponseEntity<ApiResponse<ContractResponse>> updateContract(
            @PathVariable Long id,
            @Valid @RequestBody ContractRequest request
    ) {
        ContractResponse response = contractService.updateContract(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hợp đồng thành công", response));
    }

    @PatchMapping("/{id}/terminate")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Thanh lý hợp đồng thuê phòng (Admin/Staff)")
    public ResponseEntity<ApiResponse<ContractResponse>> terminateContract(
            @PathVariable Long id,
            @RequestBody(required = false) TerminateContractRequest request
    ) {
        ContractResponse response = contractService.terminateContract(id, request);
        return ResponseEntity.ok(ApiResponse.success("Thanh lý hợp đồng thành công", response));
    }
}
