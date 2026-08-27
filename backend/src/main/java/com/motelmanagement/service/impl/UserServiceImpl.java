package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.UserCreateRequest;
import com.motelmanagement.dto.request.UserUpdateRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.UserResponse;
import com.motelmanagement.entity.Role;
import com.motelmanagement.entity.Tenant;
import com.motelmanagement.entity.User;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.enums.RoleName;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.DuplicateResourceException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.RoleRepository;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.repository.UserRepository;
import com.motelmanagement.service.UserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final ContractRepository contractRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(String search, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), searchLike),
                        cb.like(cb.lower(root.get("email")), searchLike),
                        cb.like(cb.lower(root.get("fullName")), searchLike),
                        cb.like(cb.lower(root.get("phone")), searchLike)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> page = userRepository.findAll(spec, pageable);
        List<UserResponse> content = page.getContent().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã tồn tại");
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", request.getRole()));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(role)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        User saved = userRepository.save(user);
        log.info("Created user id: {}, username: {}", saved.getId(), saved.getUsername());

        // If user is a tenant, automatically create / link a tenant profile
        if (role.getName() == RoleName.ROLE_TENANT) {
            String identityNumber = "CCCD" + String.format("%08d", System.currentTimeMillis() % 100000000L);
            Tenant tenant = Tenant.builder()
                    .fullName(saved.getFullName())
                    .phone(saved.getPhone() != null ? saved.getPhone() : "09" + String.format("%08d", saved.getId()))
                    .email(saved.getEmail())
                    .identityNumber(identityNumber)
                    .user(saved)
                    .build();
            tenantRepository.save(tenant);
            log.info("Auto-created tenant profile for user: {}", saved.getUsername());
        }

        return mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã được sử dụng");
        }

        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null) {
            Role role = roleRepository.findByName(request.getRole())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", request.getRole()));
            user.setRole(role);
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User updated = userRepository.save(user);
        log.info("Updated user id: {}", updated.getId());
        return mapToUserResponse(updated);
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setActive(!user.isActive());
        userRepository.save(user);
        log.info("Toggled active status of user id: {} to {}", id, user.isActive());
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Prevent deleting admin account
        if (user.getUsername().equalsIgnoreCase("admin")) {
            throw new BadRequestException("Không thể xóa tài khoản Quản trị viên hệ thống (admin)");
        }

        // Check if user is linked to any tenant
        Optional<Tenant> tenantOpt = tenantRepository.findByUserId(id);
        if (tenantOpt.isPresent()) {
            Tenant tenant = tenantOpt.get();
            if (contractRepository.existsByTenantIdAndStatus(tenant.getId(), ContractStatus.ACTIVE)) {
                throw new BadRequestException("Không thể xóa tài khoản của khách thuê '" + tenant.getFullName() + "' vì đang có hợp đồng hoạt động (ACTIVE). Vui lòng thanh lý hợp đồng trước khi xóa.");
            }

            // Unlink tenant user so deletion succeeds cleanly
            tenant.setUser(null);
            tenantRepository.save(tenant);
        }

        userRepository.delete(user);
        log.info("Deleted user id: {}", id);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().getName())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
