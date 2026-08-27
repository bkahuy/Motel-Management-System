package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.ChangePasswordRequest;
import com.motelmanagement.dto.request.LoginRequest;
import com.motelmanagement.dto.request.RegisterRequest;
import com.motelmanagement.dto.response.AuthResponse;
import com.motelmanagement.dto.response.UserResponse;
import com.motelmanagement.entity.Role;
import com.motelmanagement.entity.Tenant;
import com.motelmanagement.entity.User;
import com.motelmanagement.enums.RoleName;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.DuplicateResourceException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.RoleRepository;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.repository.UserRepository;
import com.motelmanagement.security.JwtService;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting authentication for user: {}", request.getUsernameOrEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(userPrincipal);

        UserResponse userResponse = UserResponse.builder()
                .id(userPrincipal.getId())
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getEmail())
                .fullName(userPrincipal.getFullName())
                .role(userPrincipal.getRole())
                .active(userPrincipal.isActive())
                .build();

        log.info("User {} successfully logged in with role {}", userPrincipal.getUsername(), userPrincipal.getRole());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tên đăng nhập '" + request.getUsername() + "' đã được sử dụng");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã được sử dụng");
        }

        Role tenantRole = roleRepository.findByName(RoleName.ROLE_TENANT)
                .orElseThrow(() -> new ResourceNotFoundException("Vai trò ROLE_TENANT chưa được khởi tạo"));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(tenantRole)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getUsername());

        // Automatically create corresponding tenant profile
        String identityNumber = "CCCD" + String.format("%08d", System.currentTimeMillis() % 100000000L);
        Tenant tenant = Tenant.builder()
                .fullName(savedUser.getFullName())
                .phone(savedUser.getPhone() != null ? savedUser.getPhone() : "09" + String.format("%08d", savedUser.getId()))
                .email(savedUser.getEmail())
                .identityNumber(identityNumber)
                .user(savedUser)
                .build();
        tenantRepository.save(tenant);
        log.info("Auto-created tenant profile for registered user: {}", savedUser.getUsername());

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(UserPrincipal currentUser, ChangePasswordRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getUsername());
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
