package com.motelmanagement.service;

import com.motelmanagement.dto.request.BuildingRequest;
import com.motelmanagement.dto.response.BuildingResponse;
import com.motelmanagement.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BuildingService {
    PageResponse<BuildingResponse> getBuildings(String search, Pageable pageable);
    List<BuildingResponse> getAllBuildings();
    BuildingResponse getBuildingById(Long id);
    BuildingResponse createBuilding(BuildingRequest request);
    BuildingResponse updateBuilding(Long id, BuildingRequest request);
    void deleteBuilding(Long id);
}
