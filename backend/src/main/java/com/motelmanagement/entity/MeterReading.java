package com.motelmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "meter_readings",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_contract_reading_month", columnNames = {"contract_id", "reading_month"})
    },
    indexes = {
        @Index(name = "idx_meter_reading_month", columnList = "reading_month")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeterReading extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "reading_month", length = 7, nullable = false) // e.g. "2026-08"
    private String readingMonth;

    @Column(name = "electricity_previous", nullable = false)
    private Integer electricityPrevious;

    @Column(name = "electricity_current", nullable = false)
    private Integer electricityCurrent;

    @Column(name = "water_previous", nullable = false)
    private Integer waterPrevious;

    @Column(name = "water_current", nullable = false)
    private Integer waterCurrent;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Transient
    public int getElectricityUsage() {
        return electricityCurrent != null && electricityPrevious != null ? electricityCurrent - electricityPrevious : 0;
    }

    @Transient
    public int getWaterUsage() {
        return waterCurrent != null && waterPrevious != null ? waterCurrent - waterPrevious : 0;
    }
}
