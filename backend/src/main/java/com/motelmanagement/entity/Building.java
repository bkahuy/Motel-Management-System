package com.motelmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "buildings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building extends BaseEntity {

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "address", length = 255, nullable = false)
    private String address;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "total_floors")
    private Integer totalFloors;

    @Builder.Default
    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Room> rooms = new ArrayList<>();
}
