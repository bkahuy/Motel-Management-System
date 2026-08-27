package com.motelmanagement.repository;

import com.motelmanagement.entity.Room;
import com.motelmanagement.enums.RoomStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {

    Optional<Room> findByBuildingIdAndRoomNumber(Long buildingId, String roomNumber);

    boolean existsByBuildingIdAndRoomNumber(Long buildingId, String roomNumber);

    boolean existsByBuildingIdAndRoomNumberAndIdNot(Long buildingId, String roomNumber, Long id);

    long countByStatus(RoomStatus status);

    long countByBuildingId(Long buildingId);

    List<Room> findByBuildingId(Long buildingId);

    List<Room> findByStatus(RoomStatus status);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.building LEFT JOIN FETCH r.services WHERE r.id = :id")
    Optional<Room> findByIdWithDetails(@Param("id") Long id);
}
