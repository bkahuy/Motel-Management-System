package com.motelmanagement.service;

import com.motelmanagement.dto.request.UserCreateRequest;
import com.motelmanagement.dto.request.UserUpdateRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    PageResponse<UserResponse> getUsers(String search, Pageable pageable);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void toggleUserStatus(Long id);
    void deleteUser(Long id);
}
