package com.motelmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatisticsResponse {
    private List<MonthlyRevenueItem> items;
    private BigDecimal totalRevenue;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueItem {
        private String month;       // e.g. "2026-03"
        private String monthLabel;  // e.g. "Tháng 03/2026"
        private BigDecimal revenue;
        private int invoiceCount;
    }
}
