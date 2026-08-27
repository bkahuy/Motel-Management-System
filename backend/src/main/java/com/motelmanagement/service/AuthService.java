package com.motelmanagement.service;

import com.motelmanagement.dto.request.ChangePasswordRequest;
import com.motelmanagement.dto.request.LoginRequest;
import com.motelmanagement.dto.request.RegisterRequest;
import com.motelmanagement.dto.response.AuthResponse;
import com.motelmanagement.dto.response.UserResponse;
import com.motelmanagement.security.UserPrincipal;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserResponse register(RegisterRequest request);
    UserResponse getCurrentUser(UserPrincipal currentUser);
    void changePassword(UserPrincipal currentUser, ChangePasswordRequest request);
}
