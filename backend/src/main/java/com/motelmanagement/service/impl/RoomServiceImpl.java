package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.RoomRequest;
import com.motelmanagement.dto.request.RoomServiceAssignRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.RoomResponse;
import com.motelmanagement.dto.response.ServiceResponse;
import com.motelmanagement.entity.Building;
import com.motelmanagement.entity.Contract;
import com.motelmanagement.entity.Room;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.enums.RoomStatus;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.DuplicateResourceException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.BuildingRepository;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.RoomRepository;
import com.motelmanagement.repository.ServiceRepository;
import com.motelmanagement.service.RoomService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private static final Logger log = LoggerFactory.getLogger(RoomServiceImpl.class);

    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final ServiceRepository serviceRepository;
    private final ContractRepository contractRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> getRooms(String search, Long buildingId, RoomStatus status, Pageable pageable) {
        Specification<Room> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("roomNumber")), searchLike),
                        cb.like(cb.lower(root.get("description")), searchLike)
                ));
            }

            if (buildingId != null) {
                predicates.add(cb.equal(root.get("building").get("id"), buildingId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Room> page = roomRepository.findAll(spec, pageable);
        List<RoomResponse> content = page.getContent().stream()
                .map(this::mapToRoomResponse)
                .collect(Collectors.toList());

        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToRoomResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableRooms() {
        return roomRepository.findByStatus(RoomStatus.AVAILABLE).stream()
                .map(this::mapToRoomResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
        return mapToRoomResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building", "id", request.getBuildingId()));

        if (roomRepository.existsByBuildingIdAndRoomNumber(request.getBuildingId(), request.getRoomNumber())) {
            throw new DuplicateResourceException(
                    String.format("Phòng số '%s' đã tồn tại trong tòa nhà '%s'", request.getRoomNumber(), building.getName())
            );
        }

        Room room = Room.builder()
                .building(building)
                .roomNumber(request.getRoomNumber())
                .price(request.getPrice())
                .area(request.getArea())
                .maxOccupants(request.getMaxOccupants())
                .deposit(request.getDeposit())
                .status(request.getStatus() != null ? request.getStatus() : RoomStatus.AVAILABLE)
                .description(request.getDescription())
                .build();

        if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
            Set<com.motelmanagement.entity.Service> services = new HashSet<>(
                    serviceRepository.findAllById(request.getServiceIds())
            );
            room.setServices(services);
        }

        Room saved = roomRepository.save(room);
        log.info("Created room id: {}, roomNumber: {}", saved.getId(), saved.getRoomNumber());
        return mapToRoomResponse(saved);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));

        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building", "id", request.getBuildingId()));

        if (roomRepository.existsByBuildingIdAndRoomNumberAndIdNot(request.getBuildingId(), request.getRoomNumber(), id)) {
            throw new DuplicateResourceException(
                    String.format("Phòng số '%s' đã tồn tại trong tòa nhà '%s'", request.getRoomNumber(), building.getName())
            );
        }

        room.setBuilding(building);
        room.setRoomNumber(request.getRoomNumber());
        room.setPrice(request.getPrice());
        room.setArea(request.getArea());
        room.setMaxOccupants(request.getMaxOccupants());
        room.setDeposit(request.getDeposit());
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }
        room.setDescription(request.getDescription());

        if (request.getServiceIds() != null) {
            Set<com.motelmanagement.entity.Service> services = new HashSet<>(
                    serviceRepository.findAllById(request.getServiceIds())
            );
            room.setServices(services);
        }

        Room updated = roomRepository.save(room);
        log.info("Updated room id: {}", updated.getId());
        return mapToRoomResponse(updated);
    }

    @Override
    @Transactional
    public RoomResponse assignServicesToRoom(Long roomId, RoomServiceAssignRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));

        Set<com.motelmanagement.entity.Service> services = new HashSet<>(
                serviceRepository.findAllById(request.getServiceIds())
        );
        room.setServices(services);

        Room updated = roomRepository.save(room);
        log.info("Assigned {} services to room id: {}", services.size(), roomId);
        return mapToRoomResponse(updated);
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));

        if (contractRepository.existsByRoomIdAndStatus(id, ContractStatus.ACTIVE)) {
            throw new BadRequestException("Không thể xóa phòng '" + room.getRoomNumber() + "' vì đang có hợp đồng hoạt động (ACTIVE)");
        }

        roomRepository.delete(room);
        log.info("Deleted room id: {}", id);
    }

    private RoomResponse mapToRoomResponse(Room room) {
        List<ServiceResponse> serviceResponses = room.getServices() != null ?
                room.getServices().stream()
                        .map(s -> ServiceResponse.builder()
                                .id(s.getId())
                                .name(s.getName())
                                .price(s.getPrice())
                                .unit(s.getUnit())
                                .description(s.getDescription())
                                .active(s.isActive())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>();

        String tenantName = null;
        String tenantPhone = null;
        Long contractId = null;

        if (room.getStatus() == RoomStatus.OCCUPIED) {
            var activeContract = contractRepository.findByRoomIdAndStatus(room.getId(), ContractStatus.ACTIVE);
            if (activeContract.isPresent()) {
                Contract c = activeContract.get();
                contractId = c.getId();
                if (c.getTenant() != null) {
                    tenantName = c.getTenant().getFullName();
                    tenantPhone = c.getTenant().getPhone();
                }
            }
        }

        return RoomResponse.builder()
                .id(room.getId())
                .buildingId(room.getBuilding() != null ? room.getBuilding().getId() : null)
                .buildingName(room.getBuilding() != null ? room.getBuilding().getName() : null)
                .roomNumber(room.getRoomNumber())
                .price(room.getPrice())
                .area(room.getArea())
                .maxOccupants(room.getMaxOccupants())
                .deposit(room.getDeposit())
                .status(room.getStatus())
                .description(room.getDescription())
                .services(serviceResponses)
                .currentTenantName(tenantName)
                .currentTenantPhone(tenantPhone)
                .currentContractId(contractId)
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}
