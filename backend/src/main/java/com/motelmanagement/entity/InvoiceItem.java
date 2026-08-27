package com.motelmanagement.entity;

import com.motelmanagement.enums.InvoiceItemType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", length = 30, nullable = false)
    private InvoiceItemType itemType;

    @Column(name = "description", length = 255, nullable = false)
    private String description;

    @Builder.Default
    @Column(name = "quantity", precision = 10, scale = 2, nullable = false)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;
}
