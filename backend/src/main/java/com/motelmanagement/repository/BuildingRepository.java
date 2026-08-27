package com.motelmanagement.repository;

import com.motelmanagement.entity.Building;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
    Optional<Building> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT b FROM Building b WHERE " +
           "(:search IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.address) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Building> searchBuildings(@Param("search") String search, Pageable pageable);
}
