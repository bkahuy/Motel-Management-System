package com.motelmanagement.entity;

import com.motelmanagement.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "rooms",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_building_room_number", columnNames = {"building_id", "room_number"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "room_number", length = 50, nullable = false)
    private String roomNumber;

    @Column(name = "price", precision = 12, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "area", precision = 6, scale = 2, nullable = false)
    private BigDecimal area;

    @Builder.Default
    @Column(name = "max_occupants", nullable = false)
    private Integer maxOccupants = 2;

    @Builder.Default
    @Column(name = "deposit", precision = 12, scale = 2, nullable = false)
    private BigDecimal deposit = BigDecimal.ZERO;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "room_services",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id"),
        uniqueConstraints = @UniqueConstraint(name = "uk_room_service", columnNames = {"room_id", "service_id"})
    )
    private Set<Service> services = new HashSet<>();
}
