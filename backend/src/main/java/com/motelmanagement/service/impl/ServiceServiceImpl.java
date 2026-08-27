package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.ServiceRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.ServiceResponse;
import com.motelmanagement.entity.Service;
import com.motelmanagement.exception.DuplicateResourceException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.ServiceRepository;
import com.motelmanagement.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private static final Logger log = LoggerFactory.getLogger(ServiceServiceImpl.class);

    private final ServiceRepository serviceRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ServiceResponse> getServices(String search, Pageable pageable) {
        Page<Service> page = serviceRepository.searchServices(search, pageable);
        List<ServiceResponse> content = page.getContent().stream()
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllActiveServices() {
        return serviceRepository.findByActiveTrue().stream()
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        return mapToServiceResponse(service);
    }

    @Override
    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        if (serviceRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Dịch vụ '" + request.getName() + "' đã tồn tại");
        }

        Service service = Service.builder()
                .name(request.getName())
                .price(request.getPrice())
                .unit(request.getUnit())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Service saved = serviceRepository.save(service);
        log.info("Created service id: {}, name: {}", saved.getId(), saved.getName());
        return mapToServiceResponse(saved);
    }

    @Override
    @Transactional
    public ServiceResponse updateService(Long id, ServiceRequest request) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        if (serviceRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Dịch vụ '" + request.getName() + "' đã tồn tại");
        }

        service.setName(request.getName());
        service.setPrice(request.getPrice());
        service.setUnit(request.getUnit());
        service.setDescription(request.getDescription());
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }

        Service updated = serviceRepository.save(service);
        log.info("Updated service id: {}", updated.getId());
        return mapToServiceResponse(updated);
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        // Soft delete / toggle active or delete if no dependencies
        service.setActive(false);
        serviceRepository.save(service);
        log.info("Deactivated service id: {}", id);
    }

    private ServiceResponse mapToServiceResponse(Service service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .price(service.getPrice())
                .unit(service.getUnit())
                .description(service.getDescription())
                .active(service.isActive())
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }
}
