package com.motelmanagement.repository;

import com.motelmanagement.entity.Invoice;
import com.motelmanagement.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    Optional<Invoice> findByInvoiceCode(String invoiceCode);

    boolean existsByInvoiceCode(String invoiceCode);

    Optional<Invoice> findByContractIdAndBillingMonth(Long contractId, String billingMonth);

    List<Invoice> findByContractId(Long contractId);

    boolean existsByContractIdAndBillingMonth(Long contractId, String billingMonth);

    long countByStatus(InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status = :status AND i.billingMonth = :billingMonth")
    BigDecimal sumTotalAmountByStatusAndBillingMonth(@Param("status") InvoiceStatus status, @Param("billingMonth") String billingMonth);

    @Query("SELECT i.billingMonth AS month, COALESCE(SUM(i.totalAmount), 0) AS totalRevenue " +
           "FROM Invoice i WHERE i.status = 'PAID' AND i.billingMonth IN :months " +
           "GROUP BY i.billingMonth ORDER BY i.billingMonth ASC")
    List<Object[]> findMonthlyRevenueForMonths(@Param("months") List<String> months);

    @Query("SELECT i FROM Invoice i " +
           "LEFT JOIN FETCH i.contract c " +
           "LEFT JOIN FETCH c.room r " +
           "LEFT JOIN FETCH r.building " +
           "LEFT JOIN FETCH c.tenant t " +
           "LEFT JOIN FETCH i.items " +
           "WHERE i.id = :id")
    Optional<Invoice> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT i FROM Invoice i " +
           "LEFT JOIN FETCH i.contract c " +
           "LEFT JOIN FETCH c.room r " +
           "LEFT JOIN FETCH c.tenant t " +
           "WHERE t.user.id = :userId")
    Page<Invoice> findByTenantUserId(@Param("userId") Long userId, Pageable pageable);

    List<Invoice> findTop5ByOrderByCreatedAtDesc();

    List<Invoice> findTop5ByStatusOrderByDueDateAsc(InvoiceStatus status);

    List<Invoice> findByStatusAndDueDateBefore(InvoiceStatus status, LocalDate date);
}
