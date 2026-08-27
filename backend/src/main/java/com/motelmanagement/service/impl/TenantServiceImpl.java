package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.TenantRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.TenantResponse;
import com.motelmanagement.entity.Contract;
import com.motelmanagement.entity.Invoice;
import com.motelmanagement.entity.Tenant;
import com.motelmanagement.entity.User;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.DuplicateResourceException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.*;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.TenantService;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private static final Logger log = LoggerFactory.getLogger(TenantServiceImpl.class);

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final MeterReadingRepository meterReadingRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TenantResponse> getTenants(String search, Pageable pageable) {
        Specification<Tenant> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), searchLike),
                        cb.like(cb.lower(root.get("identityNumber")), searchLike),
                        cb.like(cb.lower(root.get("phone")), searchLike),
                        cb.like(cb.lower(root.get("email")), searchLike)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Tenant> page = tenantRepository.findAll(spec, pageable);
        List<TenantResponse> content = page.getContent().stream()
                .map(this::mapToTenantResponse)
                .collect(Collectors.toList());

        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(this::mapToTenantResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", id));
        return mapToTenantResponse(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantByUserId(Long userId) {
        Tenant tenant = tenantRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "userId", userId));
        return mapToTenantResponse(tenant);
    }

    @Override
    @Transactional
    public TenantResponse getMyProfile(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Tenant tenant = tenantRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> tenantRepository.findByEmail(currentUser.getEmail())
                .orElseGet(() -> {
                    String identityNumber = "CCCD" + String.format("%08d", System.currentTimeMillis() % 100000000L);
                    Tenant newTenant = Tenant.builder()
                            .fullName(user.getFullName())
                            .phone(user.getPhone() != null && !user.getPhone().trim().isEmpty() ? user.getPhone() : "09" + String.format("%08d", user.getId()))
                            .email(user.getEmail())
                            .identityNumber(identityNumber)
                            .user(user)
                            .build();
                    return tenantRepository.save(newTenant);
                }));

        return mapToTenantResponse(tenant);
    }

    @Override
    @Transactional
    public TenantResponse updateMyProfile(UserPrincipal currentUser, TenantRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Tenant tenant = tenantRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> tenantRepository.findByEmail(currentUser.getEmail())
                .orElseGet(() -> {
                    Tenant newT = new Tenant();
                    newT.setUser(user);
                    return newT;
                }));

        if (tenant.getId() != null) {
            if (tenantRepository.existsByIdentityNumberAndIdNot(request.getIdentityNumber(), tenant.getId())) {
                throw new DuplicateResourceException("Số CMND/CCCD '" + request.getIdentityNumber() + "' đã tồn tại trên người thuê khác");
            }
        } else {
            if (tenantRepository.existsByIdentityNumber(request.getIdentityNumber())) {
                throw new DuplicateResourceException("Số CMND/CCCD '" + request.getIdentityNumber() + "' đã tồn tại");
            }
        }

        tenant.setUser(user);
        tenant.setFullName(request.getFullName());
        tenant.setIdentityNumber(request.getIdentityNumber());
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setGender(request.getGender());
        tenant.setPhone(request.getPhone());
        tenant.setEmail(request.getEmail());
        tenant.setAddress(request.getAddress());
        tenant.setOccupation(request.getOccupation());

        // Sync with User entity
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã tồn tại trên tài khoản khác");
            }
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);

        Tenant updated = tenantRepository.save(tenant);
        log.info("Updated profile for user: {}, tenant id: {}", currentUser.getUsername(), updated.getId());
        return mapToTenantResponse(updated);
    }

    @Override
    @Transactional
    public TenantResponse createTenant(TenantRequest request) {
        if (tenantRepository.existsByIdentityNumber(request.getIdentityNumber())) {
            throw new DuplicateResourceException("Số CMND/CCCD '" + request.getIdentityNumber() + "' đã tồn tại");
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
        }

        Tenant tenant = Tenant.builder()
                .fullName(request.getFullName())
                .identityNumber(request.getIdentityNumber())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .occupation(request.getOccupation())
                .user(user)
                .build();

        Tenant saved = tenantRepository.save(tenant);
        log.info("Created tenant id: {}, name: {}", saved.getId(), saved.getFullName());
        return mapToTenantResponse(saved);
    }

    @Override
    @Transactional
    public TenantResponse updateTenant(Long id, TenantRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", id));

        if (tenantRepository.existsByIdentityNumberAndIdNot(request.getIdentityNumber(), id)) {
            throw new DuplicateResourceException("Số CMND/CCCD '" + request.getIdentityNumber() + "' đã tồn tại trên người thuê khác");
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
            tenant.setUser(user);
        }

        tenant.setFullName(request.getFullName());
        tenant.setIdentityNumber(request.getIdentityNumber());
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setGender(request.getGender());
        tenant.setPhone(request.getPhone());
        tenant.setEmail(request.getEmail());
        tenant.setAddress(request.getAddress());
        tenant.setOccupation(request.getOccupation());

        Tenant updated = tenantRepository.save(tenant);
        log.info("Updated tenant id: {}", updated.getId());
        return mapToTenantResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTenant(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", id));

        if (contractRepository.existsByTenantIdAndStatus(id, ContractStatus.ACTIVE)) {
            throw new BadRequestException("Không thể xóa khách thuê '" + tenant.getFullName() + "' vì đang có hợp đồng hoạt động (ACTIVE). Vui lòng thanh lý hợp đồng trước khi xóa.");
        }

        // Clean up any historical terminated/expired contracts and related records
        List<Contract> pastContracts = contractRepository.findByTenantId(id);
        for (Contract contract : pastContracts) {
            List<Invoice> invoices = invoiceRepository.findByContractId(contract.getId());
            for (Invoice invoice : invoices) {
                paymentRepository.deleteAll(paymentRepository.findByInvoiceId(invoice.getId()));
                invoiceRepository.delete(invoice);
            }
            meterReadingRepository.deleteAll(meterReadingRepository.findByContractId(contract.getId()));
            contractRepository.delete(contract);
        }

        // If linked to user, unlink user
        tenant.setUser(null);

        tenantRepository.delete(tenant);
        log.info("Deleted tenant id: {} and all historical records successfully", id);
    }

    private TenantResponse mapToTenantResponse(Tenant tenant) {
        Long currentRoomId = null;
        String currentRoomNumber = null;
        String currentBuildingName = null;
        Long currentContractId = null;

        var activeContracts = contractRepository.findByTenantIdAndStatus(tenant.getId(), ContractStatus.ACTIVE);
        if (!activeContracts.isEmpty()) {
            Contract c = activeContracts.get(0);
            currentContractId = c.getId();
            if (c.getRoom() != null) {
                currentRoomId = c.getRoom().getId();
                currentRoomNumber = c.getRoom().getRoomNumber();
                if (c.getRoom().getBuilding() != null) {
                    currentBuildingName = c.getRoom().getBuilding().getName();
                }
            }
        }

        return TenantResponse.builder()
                .id(tenant.getId())
                .fullName(tenant.getFullName())
                .identityNumber(tenant.getIdentityNumber())
                .dateOfBirth(tenant.getDateOfBirth())
                .gender(tenant.getGender())
                .phone(tenant.getPhone())
                .email(tenant.getEmail())
                .address(tenant.getAddress())
                .occupation(tenant.getOccupation())
                .userId(tenant.getUser() != null ? tenant.getUser().getId() : null)
                .username(tenant.getUser() != null ? tenant.getUser().getUsername() : null)
                .currentRoomId(currentRoomId)
                .currentRoomNumber(currentRoomNumber)
                .currentBuildingName(currentBuildingName)
                .currentContractId(currentContractId)
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}
