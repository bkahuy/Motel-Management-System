package com.motelmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "tenants",
    indexes = {
        @Index(name = "idx_tenant_identity", columnList = "identity_number"),
        @Index(name = "idx_tenant_phone", columnList = "phone")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant extends BaseEntity {

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "identity_number", length = 20, nullable = false, unique = true)
    private String identityNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "occupation", length = 100)
    private String occupation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
