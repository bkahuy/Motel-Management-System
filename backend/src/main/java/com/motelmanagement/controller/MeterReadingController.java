package com.motelmanagement.controller;

import com.motelmanagement.dto.request.MeterReadingRequest;
import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.MeterReadingResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.service.MeterReadingService;
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

@RestController
@RequestMapping("/api/meter-readings")
@RequiredArgsConstructor
@Tag(name = "Meter Readings", description = "Quản lý chỉ số điện nước hàng tháng")
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    @GetMapping
    @Operation(summary = "Lấy danh sách chỉ số điện nước có lọc theo tháng và phòng")
    public ResponseEntity<ApiResponse<PageResponse<MeterReadingResponse>>> getMeterReadings(
            @RequestParam(required = false) String readingMonth,
            @RequestParam(required = false) Long roomId,
            @PageableDefault(sort = "readingMonth", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<MeterReadingResponse> response = meterReadingService.getMeterReadings(readingMonth, roomId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết chỉ số điện nước theo ID")
    public ResponseEntity<ApiResponse<MeterReadingResponse>> getMeterReadingById(@PathVariable Long id) {
        MeterReadingResponse response = meterReadingService.getMeterReadingById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/latest/{contractId}")
    @Operation(summary = "Lấy chỉ số ghi gần nhất của hợp đồng")
    public ResponseEntity<ApiResponse<MeterReadingResponse>> getLatestReading(@PathVariable Long contractId) {
        MeterReadingResponse response = meterReadingService.getLatestReadingByContractId(contractId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Ghi chỉ số điện nước mới (Admin/Staff)")
    public ResponseEntity<ApiResponse<MeterReadingResponse>> createMeterReading(@Valid @RequestBody MeterReadingRequest request) {
        MeterReadingResponse response = meterReadingService.createMeterReading(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ghi chỉ số điện nước thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Cập nhật chỉ số điện nước (Admin/Staff)")
    public ResponseEntity<ApiResponse<MeterReadingResponse>> updateMeterReading(
            @PathVariable Long id,
            @Valid @RequestBody MeterReadingRequest request
    ) {
        MeterReadingResponse response = meterReadingService.updateMeterReading(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chỉ số điện nước thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Xóa bản ghi chỉ số (Admin/Staff)")
    public ResponseEntity<ApiResponse<Void>> deleteMeterReading(@PathVariable Long id) {
        meterReadingService.deleteMeterReading(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bản ghi chỉ số thành công", null));
    }
}
