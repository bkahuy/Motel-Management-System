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
public class DashboardStatisticsResponse {
    private long totalRooms;
    private long availableRooms;
    private long occupiedRooms;
    private long maintenanceRooms;
    private long totalTenants;
    private long activeContracts;
    private long unpaidInvoices;
    private long overdueInvoices;
    private BigDecimal monthlyRevenue;
    private BigDecimal totalUnpaidAmount;
    private List<InvoiceResponse> recentInvoices;
    private List<InvoiceResponse> unpaidInvoiceList;
}
