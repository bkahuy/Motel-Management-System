package com.motelmanagement.service;

import com.motelmanagement.dto.request.ContractRequest;
import com.motelmanagement.dto.request.TerminateContractRequest;
import com.motelmanagement.dto.response.ContractResponse;
import com.motelmanagement.entity.Building;
import com.motelmanagement.entity.Contract;
import com.motelmanagement.entity.Room;
import com.motelmanagement.entity.Tenant;
import com.motelmanagement.enums.ContractStatus;
import com.motelmanagement.enums.PaymentCycle;
import com.motelmanagement.enums.RoomStatus;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.RoomRepository;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.service.impl.ContractServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private ContractServiceImpl contractService;

    private Room availableRoom;
    private Tenant tenant;
    private ContractRequest contractRequest;

    @BeforeEach
    void setUp() {
        Building building = Building.builder().name("Building A").build();
        building.setId(1L);

        availableRoom = Room.builder()
                .building(building)
                .roomNumber("P101")
                .price(new BigDecimal("3000000"))
                .status(RoomStatus.AVAILABLE)
                .build();
        availableRoom.setId(1L);

        tenant = Tenant.builder()
                .fullName("Nguyen Van A")
                .identityNumber("001200001234")
                .phone("0987654321")
                .build();
        tenant.setId(1L);

        contractRequest = new ContractRequest(
                1L, 1L,
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 12, 31),
                new BigDecimal("3000000"),
                new BigDecimal("3000000"),
                PaymentCycle.MONTHLY,
                "Test Contract"
        );
    }

    @Test
    @DisplayName("Tạo hợp đồng thành công và chuyển trạng thái phòng sang OCCUPIED")
    void testCreateContract_Success() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(availableRoom));
        when(tenantRepository.findById(1L)).thenReturn(Optional.of(tenant));
        when(contractRepository.existsByContractCode(any())).thenReturn(false);
        when(contractRepository.save(any(Contract.class))).thenAnswer(invocation -> {
            Contract c = invocation.getArgument(0);
            c.setId(10L);
            return c;
        });

        ContractResponse response = contractService.createContract(contractRequest);

        assertNotNull(response);
        assertEquals(ContractStatus.ACTIVE, response.getStatus());
        assertEquals(RoomStatus.OCCUPIED, availableRoom.getStatus());
        verify(roomRepository, times(1)).save(availableRoom);
        verify(contractRepository, times(1)).save(any(Contract.class));
    }

    @Test
    @DisplayName("Không cho tạo hợp đồng khi phòng đang OCCUPIED")
    void testCreateContract_RoomOccupied_ThrowsException() {
        availableRoom.setStatus(RoomStatus.OCCUPIED);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(availableRoom));

        assertThrows(BadRequestException.class, () -> contractService.createContract(contractRequest));
        verify(contractRepository, never()).save(any());
    }

    @Test
    @DisplayName("Thanh lý hợp đồng thành công và chuyển trạng thái phòng về AVAILABLE")
    void testTerminateContract_Success() {
        availableRoom.setStatus(RoomStatus.OCCUPIED);
        Contract activeContract = Contract.builder()
                .contractCode("HD-202601-P101")
                .room(availableRoom)
                .tenant(tenant)
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .status(ContractStatus.ACTIVE)
                .build();
        activeContract.setId(10L);

        when(contractRepository.findById(10L)).thenReturn(Optional.of(activeContract));
        when(contractRepository.save(any(Contract.class))).thenReturn(activeContract);

        TerminateContractRequest terminateRequest = new TerminateContractRequest("Tra phong som");
        ContractResponse response = contractService.terminateContract(10L, terminateRequest);

        assertNotNull(response);
        assertEquals(ContractStatus.TERMINATED, response.getStatus());
        assertEquals(RoomStatus.AVAILABLE, availableRoom.getStatus());
        verify(roomRepository, times(1)).save(availableRoom);
    }
}
