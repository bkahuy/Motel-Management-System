package com.motelmanagement.controller;

import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.DashboardStatisticsResponse;
import com.motelmanagement.dto.response.RevenueStatisticsResponse;
import com.motelmanagement.dto.response.RoomStatusDistributionResponse;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Thống kê tổng quan, doanh thu và tỷ lệ phòng")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/statistics")
    @Operation(summary = "Lấy các chỉ số thống kê tổng quan (KPIs)")
    public ResponseEntity<ApiResponse<DashboardStatisticsResponse>> getStatistics(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        DashboardStatisticsResponse response = dashboardService.getStatistics(currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Lấy biểu đồ doanh thu theo các tháng gần nhất")
    public ResponseEntity<ApiResponse<RevenueStatisticsResponse>> getRevenueStatistics(
            @RequestParam(defaultValue = "6") int months
    ) {
        RevenueStatisticsResponse response = dashboardService.getRevenueStatistics(months);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/room-status")
    @Operation(summary = "Lấy phân bổ tỷ lệ trạng thái phòng (Trống / Đang thuê / Bảo trì)")
    public ResponseEntity<ApiResponse<RoomStatusDistributionResponse>> getRoomStatusDistribution() {
        RoomStatusDistributionResponse response = dashboardService.getRoomStatusDistribution();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
