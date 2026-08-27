package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.BuildingRequest;
import com.motelmanagement.dto.response.BuildingResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.entity.Building;
import com.motelmanagement.enums.RoomStatus;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.DuplicateResourceException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.BuildingRepository;
import com.motelmanagement.repository.RoomRepository;
import com.motelmanagement.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuildingServiceImpl implements BuildingService {

    private static final Logger log = LoggerFactory.getLogger(BuildingServiceImpl.class);

    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BuildingResponse> getBuildings(String search, Pageable pageable) {
        Page<Building> page = buildingRepository.searchBuildings(search, pageable);
        List<BuildingResponse> content = page.getContent().stream()
                .map(this::mapToBuildingResponse)
                .collect(Collectors.toList());
        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponse> getAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(this::mapToBuildingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BuildingResponse getBuildingById(Long id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building", "id", id));
        return mapToBuildingResponse(building);
    }

    @Override
    @Transactional
    public BuildingResponse createBuilding(BuildingRequest request) {
        if (buildingRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Tòa nhà với tên '" + request.getName() + "' đã tồn tại");
        }

        Building building = Building.builder()
                .name(request.getName())
                .address(request.getAddress())
                .description(request.getDescription())
                .totalFloors(request.getTotalFloors())
                .build();

        Building saved = buildingRepository.save(building);
        log.info("Created building id: {}, name: {}", saved.getId(), saved.getName());
        return mapToBuildingResponse(saved);
    }

    @Override
    @Transactional
    public BuildingResponse updateBuilding(Long id, BuildingRequest request) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building", "id", id));

        if (buildingRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Tòa nhà với tên '" + request.getName() + "' đã tồn tại");
        }

        building.setName(request.getName());
        building.setAddress(request.getAddress());
        building.setDescription(request.getDescription());
        building.setTotalFloors(request.getTotalFloors());

        Building updated = buildingRepository.save(building);
        log.info("Updated building id: {}", updated.getId());
        return mapToBuildingResponse(updated);
    }

    @Override
    @Transactional
    public void deleteBuilding(Long id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building", "id", id));

        long roomCount = roomRepository.countByBuildingId(id);
        if (roomCount > 0) {
            throw new BadRequestException("Không thể xóa tòa nhà '" + building.getName() + "' vì vẫn còn " + roomCount + " phòng trực thuộc");
        }

        buildingRepository.delete(building);
        log.info("Deleted building id: {}", id);
    }

    private BuildingResponse mapToBuildingResponse(Building building) {
        int totalRooms = building.getRooms() != null ? building.getRooms().size() : 0;
        int availableRooms = 0;
        int occupiedRooms = 0;

        if (building.getRooms() != null) {
            for (var room : building.getRooms()) {
                if (room.getStatus() == RoomStatus.AVAILABLE) availableRooms++;
                else if (room.getStatus() == RoomStatus.OCCUPIED) occupiedRooms++;
            }
        }

        return BuildingResponse.builder()
                .id(building.getId())
                .name(building.getName())
                .address(building.getAddress())
                .description(building.getDescription())
                .totalFloors(building.getTotalFloors())
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .occupiedRooms(occupiedRooms)
                .createdAt(building.getCreatedAt())
                .updatedAt(building.getUpdatedAt())
                .build();
    }
}
