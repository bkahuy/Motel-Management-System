package com.motelmanagement.entity;

import com.motelmanagement.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "invoices",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_contract_billing_month", columnNames = {"contract_id", "billing_month"})
    },
    indexes = {
        @Index(name = "idx_invoice_code", columnList = "invoice_code"),
        @Index(name = "idx_invoice_status", columnList = "status"),
        @Index(name = "idx_invoice_billing_month", columnList = "billing_month")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice extends BaseEntity {

    @Column(name = "invoice_code", length = 50, nullable = false, unique = true)
    private String invoiceCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "billing_month", length = 7, nullable = false) // e.g. "2026-08"
    private String billingMonth;

    @Column(name = "room_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal roomFee;

    @Column(name = "electricity_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal electricityFee;

    @Column(name = "water_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal waterFee;

    @Builder.Default
    @Column(name = "service_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal serviceFee = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "other_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal otherFee = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Payment> payments = new ArrayList<>();

    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }
}
