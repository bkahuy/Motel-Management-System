package com.motelmanagement.service;

import com.motelmanagement.dto.response.DashboardStatisticsResponse;
import com.motelmanagement.dto.response.RevenueStatisticsResponse;
import com.motelmanagement.dto.response.RoomStatusDistributionResponse;
import com.motelmanagement.security.UserPrincipal;

public interface DashboardService {
    DashboardStatisticsResponse getStatistics(UserPrincipal currentUser);
    RevenueStatisticsResponse getRevenueStatistics(int months);
    RoomStatusDistributionResponse getRoomStatusDistribution();
}
