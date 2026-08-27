package com.motelmanagement.repository;

import com.motelmanagement.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    List<Payment> findByInvoiceId(Long invoiceId);

    @Query("SELECT p FROM Payment p " +
           "LEFT JOIN FETCH p.invoice i " +
           "LEFT JOIN FETCH i.contract c " +
           "LEFT JOIN FETCH c.room r " +
           "LEFT JOIN FETCH c.tenant t " +
           "WHERE t.user.id = :userId")
    Page<Payment> findByTenantUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Payment p " +
           "LEFT JOIN FETCH p.invoice i " +
           "LEFT JOIN FETCH i.contract c " +
           "LEFT JOIN FETCH c.room r " +
           "LEFT JOIN FETCH c.tenant t " +
           "ORDER BY p.paymentDate DESC")
    Page<Payment> findAllWithDetails(Pageable pageable);
}
