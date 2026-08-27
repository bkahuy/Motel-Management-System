package com.motelmanagement.controller;

import com.motelmanagement.dto.request.RoomRequest;
import com.motelmanagement.dto.request.RoomServiceAssignRequest;
import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.RoomResponse;
import com.motelmanagement.enums.RoomStatus;
import com.motelmanagement.service.RoomService;
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
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Quản lý phòng trọ")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Lấy danh sách phòng có phân trang, tìm kiếm, lọc theo tòa nhà và trạng thái")
    public ResponseEntity<ApiResponse<PageResponse<RoomResponse>>> getRooms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) RoomStatus status,
            @PageableDefault(sort = "roomNumber", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        PageResponse<RoomResponse> response = roomService.getRooms(search, buildingId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/available")
    @Operation(summary = "Lấy danh sách các phòng đang trống (AVAILABLE)")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAvailableRooms() {
        List<RoomResponse> response = roomService.getAvailableRooms();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết phòng theo ID")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable Long id) {
        RoomResponse response = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Tạo phòng mới (Admin/Staff)")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(@Valid @RequestBody RoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm phòng mới thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Cập nhật thông tin phòng (Admin/Staff)")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request
    ) {
        RoomResponse response = roomService.updateRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin phòng thành công", response));
    }

    @PostMapping("/{id}/services")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Gán danh sách dịch vụ cho phòng")
    public ResponseEntity<ApiResponse<RoomResponse>> assignServices(
            @PathVariable Long id,
            @Valid @RequestBody RoomServiceAssignRequest request
    ) {
        RoomResponse response = roomService.assignServicesToRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật dịch vụ cho phòng thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Xóa phòng (Admin/Staff)")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phòng thành công", null));
    }
}
