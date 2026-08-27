package com.motelmanagement.service;

import com.motelmanagement.dto.request.PaymentRequest;
import com.motelmanagement.dto.response.PaymentResponse;
import com.motelmanagement.entity.Invoice;
import com.motelmanagement.entity.Payment;
import com.motelmanagement.enums.InvoiceStatus;
import com.motelmanagement.enums.PaymentMethod;
import com.motelmanagement.enums.PaymentStatus;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.PaymentRepository;
import com.motelmanagement.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Invoice invoice;

    @BeforeEach
    void setUp() {
        invoice = Invoice.builder()
                .invoiceCode("INV-202608-P101")
                .totalAmount(new BigDecimal("3500000"))
                .status(InvoiceStatus.UNPAID)
                .payments(new ArrayList<>())
                .build();
        invoice.setId(10L);
    }

    @Test
    @DisplayName("Thanh toán đủ số tiền hóa đơn -> Chuyển trạng thái hóa đơn sang PAID")
    void testMakePayment_FullAmount_UpdatesInvoiceToPaid() {
        PaymentRequest request = new PaymentRequest(
                new BigDecimal("3500000"),
                PaymentMethod.BANK_TRANSFER,
                LocalDateTime.now(),
                "TXN-123456",
                "Thanh toan tien phong"
        );

        when(invoiceRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        PaymentResponse response = paymentService.makePayment(10L, request);

        assertNotNull(response);
        assertEquals(PaymentStatus.COMPLETED, response.getStatus());
        assertEquals(InvoiceStatus.PAID, invoice.getStatus());
        verify(invoiceRepository, times(1)).save(invoice);
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }
}
