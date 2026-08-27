package com.motelmanagement.service;

import com.motelmanagement.dto.request.MeterReadingRequest;
import com.motelmanagement.dto.response.MeterReadingResponse;
import com.motelmanagement.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MeterReadingService {
    PageResponse<MeterReadingResponse> getMeterReadings(String readingMonth, Long roomId, Pageable pageable);
    MeterReadingResponse getMeterReadingById(Long id);
    MeterReadingResponse getLatestReadingByContractId(Long contractId);
    MeterReadingResponse createMeterReading(MeterReadingRequest request);
    MeterReadingResponse updateMeterReading(Long id, MeterReadingRequest request);
    void deleteMeterReading(Long id);
}
