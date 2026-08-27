package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.ContractRequest;
import com.motelmanagement.dto.request.TerminateContractRequest;
import com.motelmanagement.dto.response.ContractResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.entity.Contract;
import com.motelmanagement.entity.Room;
import com.motelmanagement.entity.Tenant;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.enums.RoleName;
import com.motelmanagement.enums.RoomStatus;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.RoomRepository;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.ContractService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private static final Logger log = LoggerFactory.getLogger(ContractServiceImpl.class);

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ContractResponse> getContracts(
            String search,
            Long roomId,
            Long tenantId,
            Long buildingId,
            ContractStatus status,
            UserPrincipal currentUser,
            Pageable pageable
    ) {
        Specification<Contract> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<Contract, Room> roomJoin = root.join("room", JoinType.LEFT);
            Join<Contract, Tenant> tenantJoin = root.join("tenant", JoinType.LEFT);

            // If user is TENANT, filter only contracts belonging to their tenant record
            if (currentUser != null && currentUser.getRole() == RoleName.ROLE_TENANT) {
                predicates.add(cb.equal(tenantJoin.get("user").get("id"), currentUser.getId()));
            }

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("contractCode")), searchLike),
                        cb.like(cb.lower(roomJoin.get("roomNumber")), searchLike),
                        cb.like(cb.lower(tenantJoin.get("fullName")), searchLike),
                        cb.like(cb.lower(tenantJoin.get("phone")), searchLike)
                ));
            }

            if (roomId != null) {
                predicates.add(cb.equal(roomJoin.get("id"), roomId));
            }

            if (tenantId != null) {
                predicates.add(cb.equal(tenantJoin.get("id"), tenantId));
            }

            if (buildingId != null) {
                predicates.add(cb.equal(roomJoin.get("building").get("id"), buildingId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Contract> page = contractRepository.findAll(spec, pageable);
        List<ContractResponse> content = page.getContent().stream()
                .map(this::mapToContractResponse)
                .collect(Collectors.toList());

        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getActiveContracts() {
        return contractRepository.findAll().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .map(this::mapToContractResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getContractById(Long id, UserPrincipal currentUser) {
        Contract contract = contractRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

        if (currentUser != null && currentUser.getRole() == RoleName.ROLE_TENANT) {
            if (contract.getTenant() == null || contract.getTenant().getUser() == null
                    || !contract.getTenant().getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Bạn không có quyền truy cập hợp đồng này");
            }
        }

        return mapToContractResponse(contract);
    }

    @Override
    @Transactional
    public ContractResponse createContract(ContractRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate()) || request.getEndDate().isEqual(request.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc hợp đồng phải sau ngày bắt đầu");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", request.getRoomId()));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BadRequestException(
                    String.format("Không thể tạo hợp đồng vì phòng '%s' đang ở trạng thái %s (không khả dụng)",
                            room.getRoomNumber(), room.getStatus().name())
            );
        }

        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", request.getTenantId()));

        // Generate contract code: HD-YYYYMM-ROOMNO
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String cleanRoomNumber = room.getRoomNumber().replaceAll("[^a-zA-Z0-9]", "");
        String contractCode = "HD-" + datePrefix + "-" + cleanRoomNumber;

        int suffix = 1;
        while (contractRepository.existsByContractCode(contractCode)) {
            contractCode = "HD-" + datePrefix + "-" + cleanRoomNumber + "-" + suffix++;
        }

        Contract contract = Contract.builder()
                .contractCode(contractCode)
                .room(room)
                .tenant(tenant)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .rentPrice(request.getRentPrice())
                .deposit(request.getDeposit())
                .paymentCycle(request.getPaymentCycle())
                .status(ContractStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        // Synchronize Room Status: AVAILABLE -> OCCUPIED
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        Contract saved = contractRepository.save(contract);
        log.info("Created active contract: {} for room: {} and tenant: {}",
                saved.getContractCode(), room.getRoomNumber(), tenant.getFullName());

        return mapToContractResponse(saved);
    }

    @Override
    @Transactional
    public ContractResponse updateContract(Long id, ContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

        if (contract.getStatus() == ContractStatus.TERMINATED) {
            throw new BadRequestException("Không thể chỉnh sửa hợp đồng đã thanh lý (TERMINATED)");
        }

        if (request.getEndDate().isBefore(request.getStartDate()) || request.getEndDate().isEqual(request.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc hợp đồng phải sau ngày bắt đầu");
        }

        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setRentPrice(request.getRentPrice());
        contract.setDeposit(request.getDeposit());
        contract.setPaymentCycle(request.getPaymentCycle());
        contract.setNotes(request.getNotes());

        Contract updated = contractRepository.save(contract);
        log.info("Updated contract id: {}", updated.getId());
        return mapToContractResponse(updated);
    }

    @Override
    @Transactional
    public ContractResponse terminateContract(Long id, TerminateContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

        if (contract.getStatus() == ContractStatus.TERMINATED) {
            throw new BadRequestException("Hợp đồng này đã được thanh lý trước đó");
        }

        contract.setStatus(ContractStatus.TERMINATED);
        if (request != null && StringUtils.hasText(request.getReason())) {
            String updatedNotes = (contract.getNotes() != null ? contract.getNotes() + "\n" : "")
                    + "[Thanh lý lúc " + LocalDate.now() + "]: " + request.getReason();
            contract.setNotes(updatedNotes);
        }

        // Synchronize Room Status: OCCUPIED -> AVAILABLE
        Room room = contract.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
            log.info("Room {} changed to AVAILABLE following contract termination", room.getRoomNumber());
        }

        Contract terminated = contractRepository.save(contract);
        log.info("Terminated contract id: {}, code: {}", terminated.getId(), terminated.getContractCode());
        return mapToContractResponse(terminated);
    }

    private ContractResponse mapToContractResponse(Contract contract) {
        Room room = contract.getRoom();
        Tenant tenant = contract.getTenant();

        return ContractResponse.builder()
                .id(contract.getId())
                .contractCode(contract.getContractCode())
                .roomId(room != null ? room.getId() : null)
                .roomNumber(room != null ? room.getRoomNumber() : null)
                .buildingId(room != null && room.getBuilding() != null ? room.getBuilding().getId() : null)
                .buildingName(room != null && room.getBuilding() != null ? room.getBuilding().getName() : null)
                .tenantId(tenant != null ? tenant.getId() : null)
                .tenantName(tenant != null ? tenant.getFullName() : null)
                .tenantPhone(tenant != null ? tenant.getPhone() : null)
                .tenantIdentityNumber(tenant != null ? tenant.getIdentityNumber() : null)
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .rentPrice(contract.getRentPrice())
                .deposit(contract.getDeposit())
                .paymentCycle(contract.getPaymentCycle())
                .status(contract.getStatus())
                .notes(contract.getNotes())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}
