package com.motelmanagement.repository;

import com.motelmanagement.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long>, JpaSpecificationExecutor<Tenant> {

    Optional<Tenant> findByIdentityNumber(String identityNumber);

    boolean existsByIdentityNumber(String identityNumber);

    boolean existsByIdentityNumberAndIdNot(String identityNumber, Long id);

    Optional<Tenant> findByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    Optional<Tenant> findByEmail(String email);

    Optional<Tenant> findByUserId(Long userId);
}
