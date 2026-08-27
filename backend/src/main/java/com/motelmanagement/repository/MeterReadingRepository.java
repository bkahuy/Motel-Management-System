package com.motelmanagement.repository;

import com.motelmanagement.entity.MeterReading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterReadingRepository extends JpaRepository<MeterReading, Long>, JpaSpecificationExecutor<MeterReading> {

    Optional<MeterReading> findByContractIdAndReadingMonth(Long contractId, String readingMonth);

    boolean existsByContractIdAndReadingMonth(Long contractId, String readingMonth);

    Optional<MeterReading> findTopByContractIdOrderByReadingMonthDesc(Long contractId);

    List<MeterReading> findByContractId(Long contractId);

    List<MeterReading> findByContractIdOrderByReadingMonthDesc(Long contractId);

    @Query("SELECT m FROM MeterReading m " +
           "LEFT JOIN FETCH m.contract c " +
           "LEFT JOIN FETCH c.room r " +
           "LEFT JOIN FETCH r.building " +
           "LEFT JOIN FETCH c.tenant " +
           "WHERE (:readingMonth IS NULL OR m.readingMonth = :readingMonth) " +
           "AND (:roomId IS NULL OR r.id = :roomId) " +
           "ORDER BY m.readingMonth DESC, r.roomNumber ASC")
    Page<MeterReading> findAllWithFilters(@Param("readingMonth") String readingMonth,
                                         @Param("roomId") Long roomId,
                                         Pageable pageable);
}
