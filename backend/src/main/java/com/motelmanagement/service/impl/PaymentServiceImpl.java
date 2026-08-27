package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.PaymentRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.PaymentResponse;
import com.motelmanagement.entity.Contract;
import com.motelmanagement.entity.Invoice;
import com.motelmanagement.entity.Payment;
import com.motelmanagement.entity.Room;
import com.motelmanagement.entity.Tenant;
import com.motelmanagement.enums.InvoiceStatus;
import com.motelmanagement.enums.PaymentStatus;
import com.motelmanagement.enums.RoleName;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.PaymentRepository;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getPayments(UserPrincipal currentUser, Pageable pageable) {
        Page<Payment> page;
        if (currentUser != null && currentUser.getRole() == RoleName.ROLE_TENANT) {
            page = paymentRepository.findByTenantUserId(currentUser.getId(), pageable);
        } else {
            page = paymentRepository.findAllWithDetails(pageable);
        }

        List<PaymentResponse> content = page.getContent().stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());

        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoiceId(Long invoiceId, UserPrincipal currentUser) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", invoiceId));

        if (currentUser != null && currentUser.getRole() == RoleName.ROLE_TENANT) {
            Contract c = invoice.getContract();
            if (c == null || c.getTenant() == null || c.getTenant().getUser() == null
                    || !c.getTenant().getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Bạn không có quyền xem thông tin thanh toán của hóa đơn này");
            }
        }

        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse makePayment(Long invoiceId, PaymentRequest request) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Hóa đơn '" + invoice.getInvoiceCode() + "' đã được thanh toán đầy đủ trước đó");
        }

        // Calculate already paid amount
        BigDecimal currentPaid = invoice.getPayments().stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = invoice.getTotalAmount().subtract(currentPaid);
        if (request.getAmount().compareTo(remaining) > 0) {
            log.warn("Payment amount {} exceeds remaining amount {}", request.getAmount(), remaining);
        }

        String transactionCode = request.getTransactionCode();
        if (transactionCode == null || transactionCode.isBlank()) {
            transactionCode = "TXN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                    + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        LocalDateTime paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDateTime.now();

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentDate(paymentDate)
                .transactionCode(transactionCode)
                .status(PaymentStatus.COMPLETED)
                .notes(request.getNotes())
                .build();

        Payment saved = paymentRepository.save(payment);

        // Update Invoice status to PAID if total paid is >= invoice.totalAmount
        BigDecimal newTotalPaid = currentPaid.add(request.getAmount());
        if (newTotalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
            log.info("Invoice {} is now marked as PAID", invoice.getInvoiceCode());
        }

        log.info("Recorded payment id: {} for invoice: {}, amount: {}", saved.getId(), invoice.getInvoiceCode(), saved.getAmount());
        return mapToPaymentResponse(saved);
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        Invoice invoice = payment.getInvoice();
        String invoiceCode = null;
        String roomNumber = null;
        String tenantName = null;
        String billingMonth = null;

        if (invoice != null) {
            invoiceCode = invoice.getInvoiceCode();
            billingMonth = invoice.getBillingMonth();
            if (invoice.getContract() != null) {
                Room r = invoice.getContract().getRoom();
                Tenant t = invoice.getContract().getTenant();
                if (r != null) roomNumber = r.getRoomNumber();
                if (t != null) tenantName = t.getFullName();
            }
        }

        return PaymentResponse.builder()
                .id(payment.getId())
                .invoiceId(invoice != null ? invoice.getId() : null)
                .invoiceCode(invoiceCode)
                .roomNumber(roomNumber)
                .tenantName(tenantName)
                .billingMonth(billingMonth)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentDate(payment.getPaymentDate())
                .transactionCode(payment.getTransactionCode())
                .status(payment.getStatus())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
