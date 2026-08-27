package com.motelmanagement.controller;

import com.motelmanagement.dto.request.InvoiceCalculateRequest;
import com.motelmanagement.dto.request.InvoiceCreateRequest;
import com.motelmanagement.dto.request.PaymentRequest;
import com.motelmanagement.dto.response.*;
import com.motelmanagement.enums.InvoiceStatus;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.InvoiceService;
import com.motelmanagement.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Quản lý hóa đơn tiền phòng và thanh toán")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Lấy danh sách hóa đơn có phân trang, tìm kiếm và lọc")
    public ResponseEntity<ApiResponse<PageResponse<InvoiceResponse>>> getInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String billingMonth,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) Long roomId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<InvoiceResponse> response = invoiceService.getInvoices(
                search, billingMonth, status, roomId, currentUser, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết hóa đơn theo ID")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        InvoiceResponse response = invoiceService.getInvoiceById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/calculate-preview")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Xem trước kết quả tính toán chi phí hóa đơn (Admin/Staff)")
    public ResponseEntity<ApiResponse<InvoiceCalculateResponse>> calculatePreview(
            @Valid @RequestBody InvoiceCalculateRequest request
    ) {
        InvoiceCalculateResponse response = invoiceService.calculatePreview(request);
        return ResponseEntity.ok(ApiResponse.success("Tính toán hóa đơn thành công", response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Tạo mới hóa đơn (Admin/Staff)")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(
            @Valid @RequestBody InvoiceCreateRequest request
    ) {
        InvoiceResponse response = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo hóa đơn thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Xóa hóa đơn chưa thanh toán (Admin/Staff)")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa hóa đơn thành công", null));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TENANT')")
    @Operation(summary = "Thanh toán hóa đơn")
    public ResponseEntity<ApiResponse<PaymentResponse>> payInvoice(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request
    ) {
        PaymentResponse response = paymentService.makePayment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ghi nhận thanh toán thành công", response));
    }

    @GetMapping("/{id}/payments")
    @Operation(summary = "Lấy lịch sử thanh toán của hóa đơn")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getInvoicePayments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<PaymentResponse> response = paymentService.getPaymentsByInvoiceId(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
