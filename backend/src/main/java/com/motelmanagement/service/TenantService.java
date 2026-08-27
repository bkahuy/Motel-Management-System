package com.motelmanagement.service;

import com.motelmanagement.dto.request.TenantRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.TenantResponse;
import com.motelmanagement.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TenantService {
    PageResponse<TenantResponse> getTenants(String search, Pageable pageable);
    List<TenantResponse> getAllTenants();
    TenantResponse getTenantById(Long id);
    TenantResponse getTenantByUserId(Long userId);
    TenantResponse getMyProfile(UserPrincipal currentUser);
    TenantResponse updateMyProfile(UserPrincipal currentUser, TenantRequest request);
    TenantResponse createTenant(TenantRequest request);
    TenantResponse updateTenant(Long id, TenantRequest request);
    void deleteTenant(Long id);
}
