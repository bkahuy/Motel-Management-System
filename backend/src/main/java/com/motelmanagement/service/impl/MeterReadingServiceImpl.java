package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.MeterReadingRequest;
import com.motelmanagement.dto.response.MeterReadingResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.entity.Contract;
import com.motelmanagement.entity.MeterReading;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.DuplicateResourceException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.MeterReadingRepository;
import com.motelmanagement.service.MeterReadingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeterReadingServiceImpl implements MeterReadingService {

    private static final Logger log = LoggerFactory.getLogger(MeterReadingServiceImpl.class);

    private final MeterReadingRepository meterReadingRepository;
    private final ContractRepository contractRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MeterReadingResponse> getMeterReadings(String readingMonth, Long roomId, Pageable pageable) {
        Page<MeterReading> page = meterReadingRepository.findAllWithFilters(readingMonth, roomId, pageable);
        List<MeterReadingResponse> content = page.getContent().stream()
                .map(this::mapToMeterReadingResponse)
                .collect(Collectors.toList());
        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public MeterReadingResponse getMeterReadingById(Long id) {
        MeterReading reading = meterReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MeterReading", "id", id));
        return mapToMeterReadingResponse(reading);
    }

    @Override
    @Transactional(readOnly = true)
    public MeterReadingResponse getLatestReadingByContractId(Long contractId) {
        return meterReadingRepository.findTopByContractIdOrderByReadingMonthDesc(contractId)
                .map(this::mapToMeterReadingResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public MeterReadingResponse createMeterReading(MeterReadingRequest request) {
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));

        if (meterReadingRepository.existsByContractIdAndReadingMonth(request.getContractId(), request.getReadingMonth())) {
            throw new DuplicateResourceException(
                    String.format("Đã tồn tại chỉ số điện nước tháng %s cho hợp đồng %s",
                            request.getReadingMonth(), contract.getContractCode())
            );
        }

        if (request.getElectricityCurrent() < request.getElectricityPrevious()) {
            throw new BadRequestException("Chỉ số điện mới (" + request.getElectricityCurrent() + ") không được nhỏ hơn chỉ số điện cũ (" + request.getElectricityPrevious() + ")");
        }

        if (request.getWaterCurrent() < request.getWaterPrevious()) {
            throw new BadRequestException("Chỉ số nước mới (" + request.getWaterCurrent() + ") không được nhỏ hơn chỉ số nước cũ (" + request.getWaterPrevious() + ")");
        }

        MeterReading reading = MeterReading.builder()
                .contract(contract)
                .readingMonth(request.getReadingMonth())
                .electricityPrevious(request.getElectricityPrevious())
                .electricityCurrent(request.getElectricityCurrent())
                .waterPrevious(request.getWaterPrevious())
                .waterCurrent(request.getWaterCurrent())
                .readingDate(request.getReadingDate())
                .notes(request.getNotes())
                .build();

        MeterReading saved = meterReadingRepository.save(reading);
        log.info("Created meter reading id: {} for contract: {} in month: {}",
                saved.getId(), contract.getContractCode(), saved.getReadingMonth());

        return mapToMeterReadingResponse(saved);
    }

    @Override
    @Transactional
    public MeterReadingResponse updateMeterReading(Long id, MeterReadingRequest request) {
        MeterReading reading = meterReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MeterReading", "id", id));

        if (request.getElectricityCurrent() < request.getElectricityPrevious()) {
            throw new BadRequestException("Chỉ số điện mới (" + request.getElectricityCurrent() + ") không được nhỏ hơn chỉ số điện cũ (" + request.getElectricityPrevious() + ")");
        }

        if (request.getWaterCurrent() < request.getWaterPrevious()) {
            throw new BadRequestException("Chỉ số nước mới (" + request.getWaterCurrent() + ") không được nhỏ hơn chỉ số nước cũ (" + request.getWaterPrevious() + ")");
        }

        reading.setElectricityPrevious(request.getElectricityPrevious());
        reading.setElectricityCurrent(request.getElectricityCurrent());
        reading.setWaterPrevious(request.getWaterPrevious());
        reading.setWaterCurrent(request.getWaterCurrent());
        reading.setReadingDate(request.getReadingDate());
        reading.setNotes(request.getNotes());

        MeterReading updated = meterReadingRepository.save(reading);
        log.info("Updated meter reading id: {}", updated.getId());
        return mapToMeterReadingResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMeterReading(Long id) {
        MeterReading reading = meterReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MeterReading", "id", id));

        meterReadingRepository.delete(reading);
        log.info("Deleted meter reading id: {}", id);
    }

    private MeterReadingResponse mapToMeterReadingResponse(MeterReading reading) {
        Contract contract = reading.getContract();
        String contractCode = null;
        Long roomId = null;
        String roomNumber = null;
        String buildingName = null;
        String tenantName = null;

        if (contract != null) {
            contractCode = contract.getContractCode();
            if (contract.getRoom() != null) {
                roomId = contract.getRoom().getId();
                roomNumber = contract.getRoom().getRoomNumber();
                if (contract.getRoom().getBuilding() != null) {
                    buildingName = contract.getRoom().getBuilding().getName();
                }
            }
            if (contract.getTenant() != null) {
                tenantName = contract.getTenant().getFullName();
            }
        }

        return MeterReadingResponse.builder()
                .id(reading.getId())
                .contractId(contract != null ? contract.getId() : null)
                .contractCode(contractCode)
                .roomId(roomId)
                .roomNumber(roomNumber)
                .buildingName(buildingName)
                .tenantName(tenantName)
                .readingMonth(reading.getReadingMonth())
                .electricityPrevious(reading.getElectricityPrevious())
                .electricityCurrent(reading.getElectricityCurrent())
                .electricityUsage(reading.getElectricityUsage())
                .waterPrevious(reading.getWaterPrevious())
                .waterCurrent(reading.getWaterCurrent())
                .waterUsage(reading.getWaterUsage())
                .readingDate(reading.getReadingDate())
                .notes(reading.getNotes())
                .createdAt(reading.getCreatedAt())
                .build();
    }
}
