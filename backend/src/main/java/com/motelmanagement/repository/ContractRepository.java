package com.motelmanagement.repository;

import com.motelmanagement.entity.Contract;
import com.motelmanagement.enums.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long>, JpaSpecificationExecutor<Contract> {

    Optional<Contract> findByContractCode(String contractCode);

    boolean existsByContractCode(String contractCode);

    Optional<Contract> findByRoomIdAndStatus(Long roomId, ContractStatus status);

    List<Contract> findByTenantId(Long tenantId);

    List<Contract> findByTenantIdAndStatus(Long tenantId, ContractStatus status);

    boolean existsByTenantIdAndStatus(Long tenantId, ContractStatus status);

    boolean existsByRoomIdAndStatus(Long roomId, ContractStatus status);

    long countByStatus(ContractStatus status);

    @Query("SELECT c FROM Contract c " +
           "LEFT JOIN FETCH c.room r " +
           "LEFT JOIN FETCH r.building " +
           "LEFT JOIN FETCH c.tenant " +
           "WHERE c.id = :id")
    Optional<Contract> findByIdWithDetails(@Param("id") Long id);
}
