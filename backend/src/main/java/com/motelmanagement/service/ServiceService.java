package com.motelmanagement.service;

import com.motelmanagement.dto.request.ServiceRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.ServiceResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ServiceService {
    PageResponse<ServiceResponse> getServices(String search, Pageable pageable);
    List<ServiceResponse> getAllActiveServices();
    ServiceResponse getServiceById(Long id);
    ServiceResponse createService(ServiceRequest request);
    ServiceResponse updateService(Long id, ServiceRequest request);
    void deleteService(Long id);
}
