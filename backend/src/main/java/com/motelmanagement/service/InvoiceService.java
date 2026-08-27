package com.motelmanagement.service;

import com.motelmanagement.dto.request.InvoiceCalculateRequest;
import com.motelmanagement.dto.request.InvoiceCreateRequest;
import com.motelmanagement.dto.response.InvoiceCalculateResponse;
import com.motelmanagement.dto.response.InvoiceResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.enums.InvoiceStatus;
import com.motelmanagement.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface InvoiceService {
    PageResponse<InvoiceResponse> getInvoices(String search, String billingMonth, InvoiceStatus status, Long roomId, UserPrincipal currentUser, Pageable pageable);
    InvoiceResponse getInvoiceById(Long id, UserPrincipal currentUser);
    InvoiceCalculateResponse calculatePreview(InvoiceCalculateRequest request);
    InvoiceResponse createInvoice(InvoiceCreateRequest request);
    void deleteInvoice(Long id);
}
