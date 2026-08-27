package com.motelmanagement.service.impl;

import com.motelmanagement.dto.response.*;
import com.motelmanagement.entity.Invoice;
import com.motelmanagement.entity.Room;
import com.motelmanagement.entity.Tenant;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.enums.InvoiceStatus;
import com.motelmanagement.enums.RoomStatus;
import com.motelmanagement.repository.*;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatisticsResponse getStatistics(UserPrincipal currentUser) {
        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.countByStatus(RoomStatus.AVAILABLE);
        long occupiedRooms = roomRepository.countByStatus(RoomStatus.OCCUPIED);
        long maintenanceRooms = roomRepository.countByStatus(RoomStatus.MAINTENANCE);

        long totalTenants = tenantRepository.count();
        long activeContracts = contractRepository.countByStatus(ContractStatus.ACTIVE);

        long unpaidInvoices = invoiceRepository.countByStatus(InvoiceStatus.UNPAID);
        long overdueInvoices = invoiceRepository.countByStatus(InvoiceStatus.OVERDUE);

        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        BigDecimal monthlyRevenue = invoiceRepository.sumTotalAmountByStatusAndBillingMonth(InvoiceStatus.PAID, currentMonth);

        BigDecimal unpaidSum = invoiceRepository.sumTotalAmountByStatus(InvoiceStatus.UNPAID);
        BigDecimal overdueSum = invoiceRepository.sumTotalAmountByStatus(InvoiceStatus.OVERDUE);
        BigDecimal totalUnpaidAmount = unpaidSum.add(overdueSum);

        List<InvoiceResponse> recentInvoices = invoiceRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::mapToSimpleInvoiceResponse)
                .collect(Collectors.toList());

        List<InvoiceResponse> unpaidInvoiceList = invoiceRepository.findTop5ByStatusOrderByDueDateAsc(InvoiceStatus.UNPAID).stream()
                .map(this::mapToSimpleInvoiceResponse)
                .collect(Collectors.toList());

        return DashboardStatisticsResponse.builder()
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .occupiedRooms(occupiedRooms)
                .maintenanceRooms(maintenanceRooms)
                .totalTenants(totalTenants)
                .activeContracts(activeContracts)
                .unpaidInvoices(unpaidInvoices)
                .overdueInvoices(overdueInvoices)
                .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
                .totalUnpaidAmount(totalUnpaidAmount)
                .recentInvoices(recentInvoices)
                .unpaidInvoiceList(unpaidInvoiceList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueStatisticsResponse getRevenueStatistics(int months) {
        if (months <= 0) months = 6;
        if (months > 24) months = 24;

        List<String> monthKeys = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = months - 1; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            monthKeys.add(d.format(DateTimeFormatter.ofPattern("yyyy-MM")));
        }

        List<Object[]> results = invoiceRepository.findMonthlyRevenueForMonths(monthKeys);
        Map<String, BigDecimal> revenueMap = new HashMap<>();
        for (Object[] row : results) {
            String m = (String) row[0];
            BigDecimal rev = (BigDecimal) row[1];
            revenueMap.put(m, rev);
        }

        List<RevenueStatisticsResponse.MonthlyRevenueItem> items = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (String mKey : monthKeys) {
            BigDecimal rev = revenueMap.getOrDefault(mKey, BigDecimal.ZERO);
            totalRevenue = totalRevenue.add(rev);

            String[] parts = mKey.split("-");
            String label = "Tháng " + parts[1] + "/" + parts[0];

            items.add(RevenueStatisticsResponse.MonthlyRevenueItem.builder()
                    .month(mKey)
                    .monthLabel(label)
                    .revenue(rev)
                    .invoiceCount(0)
                    .build());
        }

        return RevenueStatisticsResponse.builder()
                .items(items)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomStatusDistributionResponse getRoomStatusDistribution() {
        long total = roomRepository.count();
        long available = roomRepository.countByStatus(RoomStatus.AVAILABLE);
        long occupied = roomRepository.countByStatus(RoomStatus.OCCUPIED);
        long maintenance = roomRepository.countByStatus(RoomStatus.MAINTENANCE);

        List<RoomStatusDistributionResponse.StatusCount> list = new ArrayList<>();

        double availPct = total > 0 ? (available * 100.0) / total : 0;
        double occPct = total > 0 ? (occupied * 100.0) / total : 0;
        double maintPct = total > 0 ? (maintenance * 100.0) / total : 0;

        list.add(RoomStatusDistributionResponse.StatusCount.builder()
                .status("AVAILABLE")
                .statusLabel("Phòng trống")
                .count(available)
                .percentage(roundTwoDecimals(availPct))
                .color("#10B981") // Emerald
                .build());

        list.add(RoomStatusDistributionResponse.StatusCount.builder()
                .status("OCCUPIED")
                .statusLabel("Đang thuê")
                .count(occupied)
                .percentage(roundTwoDecimals(occPct))
                .color("#F59E0B") // Amber
                .build());

        list.add(RoomStatusDistributionResponse.StatusCount.builder()
                .status("MAINTENANCE")
                .statusLabel("Bảo trì")
                .count(maintenance)
                .percentage(roundTwoDecimals(maintPct))
                .color("#EF4444") // Rose
                .build());

        return RoomStatusDistributionResponse.builder()
                .distribution(list)
                .build();
    }

    private double roundTwoDecimals(double val) {
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private InvoiceResponse mapToSimpleInvoiceResponse(Invoice invoice) {
        Room r = invoice.getContract() != null ? invoice.getContract().getRoom() : null;
        Tenant t = invoice.getContract() != null ? invoice.getContract().getTenant() : null;

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceCode(invoice.getInvoiceCode())
                .contractId(invoice.getContract() != null ? invoice.getContract().getId() : null)
                .contractCode(invoice.getContract() != null ? invoice.getContract().getContractCode() : null)
                .roomId(r != null ? r.getId() : null)
                .roomNumber(r != null ? r.getRoomNumber() : null)
                .buildingName(r != null && r.getBuilding() != null ? r.getBuilding().getName() : null)
                .tenantId(t != null ? t.getId() : null)
                .tenantName(t != null ? t.getFullName() : null)
                .tenantPhone(t != null ? t.getPhone() : null)
                .billingMonth(invoice.getBillingMonth())
                .roomFee(invoice.getRoomFee())
                .electricityFee(invoice.getElectricityFee())
                .waterFee(invoice.getWaterFee())
                .serviceFee(invoice.getServiceFee())
                .otherFee(invoice.getOtherFee())
                .totalAmount(invoice.getTotalAmount())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
