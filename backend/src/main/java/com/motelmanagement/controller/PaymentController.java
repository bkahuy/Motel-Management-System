package com.motelmanagement.controller;

import com.motelmanagement.dto.response.ApiResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.PaymentResponse;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Quản lý lịch sử giao dịch thanh toán")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Lấy lịch sử thanh toán có phân trang")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getPayments(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(sort = "paymentDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<PaymentResponse> response = paymentService.getPayments(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
