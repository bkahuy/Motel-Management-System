package com.motelmanagement.entity;

import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.enums.PaymentCycle;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
    name = "contracts",
    indexes = {
        @Index(name = "idx_contract_code", columnList = "contract_code"),
        @Index(name = "idx_contract_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract extends BaseEntity {

    @Column(name = "contract_code", length = 50, nullable = false, unique = true)
    private String contractCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "rent_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal rentPrice;

    @Column(name = "deposit", precision = 12, scale = 2, nullable = false)
    private BigDecimal deposit;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_cycle", length = 30, nullable = false)
    private PaymentCycle paymentCycle = PaymentCycle.MONTHLY;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private ContractStatus status = ContractStatus.ACTIVE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
