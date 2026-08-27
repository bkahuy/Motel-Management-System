package com.motelmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service extends BaseEntity {

    @Column(name = "name", length = 100, nullable = false, unique = true)
    private String name;

    @Column(name = "price", precision = 12, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "unit", length = 50, nullable = false)
    private String unit; // e.g. "tháng", "người/tháng", "xe/tháng", "kWh", "khối"

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private boolean active = true;
}
