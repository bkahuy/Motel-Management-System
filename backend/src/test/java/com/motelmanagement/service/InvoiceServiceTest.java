package com.motelmanagement.service;

import com.motelmanagement.dto.request.InvoiceCreateRequest;
import com.motelmanagement.dto.response.InvoiceResponse;
import com.motelmanagement.entity.*;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.enums.InvoiceStatus;
import com.motelmanagement.enums.PaymentCycle;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.MeterReadingRepository;
import com.motelmanagement.repository.ServiceRepository;
import com.motelmanagement.service.impl.InvoiceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private MeterReadingRepository meterReadingRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private Contract contract;
    private MeterReading meterReading;

    @BeforeEach
    void setUp() {
        Service wifiService = Service.builder()
                .name("WiFi")
                .price(new BigDecimal("100000"))
                .unit("thang")
                .active(true)
                .build();
        wifiService.setId(1L);

        Room room = Room.builder()
                .roomNumber("P101")
                .price(new BigDecimal("3000000"))
                .services(new HashSet<>(Collections.singletonList(wifiService)))
                .build();
        room.setId(1L);

        Tenant tenant = Tenant.builder().fullName("Tran Van B").build();
        tenant.setId(1L);

        contract = Contract.builder()
                .contractCode("HD-202608-P101")
                .room(room)
                .tenant(tenant)
                .rentPrice(new BigDecimal("3000000"))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .paymentCycle(PaymentCycle.MONTHLY)
                .status(ContractStatus.ACTIVE)
                .build();
        contract.setId(1L);

        meterReading = MeterReading.builder()
                .contract(contract)
                .readingMonth("2026-08")
                .electricityPrevious(100)
                .electricityCurrent(150) // usage: 50 kWh
                .waterPrevious(20)
                .waterCurrent(25)       // usage: 5 m3
                .readingDate(LocalDate.of(2026, 8, 25))
                .build();
        meterReading.setId(1L);
    }

    @Test
    @DisplayName("Tự động tính đúng tiền phòng, điện, nước, dịch vụ và tổng tiền")
    void testCreateInvoice_CalculatesCorrectFees() {
        InvoiceCreateRequest request = new InvoiceCreateRequest(
                1L, "2026-08", LocalDate.of(2026, 9, 5),
                new BigDecimal("3500"), // 50 * 3500 = 175,000
                new BigDecimal("25000"), // 5 * 25000 = 125,000
                new BigDecimal("50000"), // other fee
                "Phi gui xe them",
                "Ghi chu"
        );

        when(contractRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(contract));
        when(invoiceRepository.existsByContractIdAndBillingMonth(1L, "2026-08")).thenReturn(false);
        when(meterReadingRepository.findByContractIdAndReadingMonth(1L, "2026-08")).thenReturn(Optional.of(meterReading));
        when(invoiceRepository.existsByInvoiceCode(any())).thenReturn(false);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice inv = invocation.getArgument(0);
            inv.setId(100L);
            return inv;
        });

        InvoiceResponse response = invoiceService.createInvoice(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("3000000"), response.getRoomFee());
        assertEquals(new BigDecimal("175000"), response.getElectricityFee());
        assertEquals(new BigDecimal("125000"), response.getWaterFee());
        assertEquals(new BigDecimal("100000"), response.getServiceFee());
        assertEquals(new BigDecimal("50000"), response.getOtherFee());

        // Total = 3000000 + 175000 + 125000 + 100000 + 50000 = 3,450,000
        assertEquals(new BigDecimal("3450000"), response.getTotalAmount());
        assertEquals(InvoiceStatus.UNPAID, response.getStatus());
    }
}
