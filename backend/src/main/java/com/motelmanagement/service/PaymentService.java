package com.motelmanagement.service;

import com.motelmanagement.dto.request.PaymentRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.PaymentResponse;
import com.motelmanagement.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PaymentService {
    PageResponse<PaymentResponse> getPayments(UserPrincipal currentUser, Pageable pageable);
    List<PaymentResponse> getPaymentsByInvoiceId(Long invoiceId, UserPrincipal currentUser);
    PaymentResponse makePayment(Long invoiceId, PaymentRequest request);
}
