package com.motelmanagement.service;

import com.motelmanagement.dto.request.ContractRequest;
import com.motelmanagement.dto.request.TerminateContractRequest;
import com.motelmanagement.dto.response.ContractResponse;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ContractService {
    PageResponse<ContractResponse> getContracts(String search, Long roomId, Long tenantId, Long buildingId, ContractStatus status, UserPrincipal currentUser, Pageable pageable);
    List<ContractResponse> getActiveContracts();
    ContractResponse getContractById(Long id, UserPrincipal currentUser);
    ContractResponse createContract(ContractRequest request);
    ContractResponse updateContract(Long id, ContractRequest request);
    ContractResponse terminateContract(Long id, TerminateContractRequest request);
}
