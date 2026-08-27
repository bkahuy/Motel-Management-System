package com.motelmanagement.service;

import com.motelmanagement.dto.request.RoomRequest;
import com.motelmanagement.dto.request.RoomServiceAssignRequest;
import com.motelmanagement.dto.response.PageResponse;
import com.motelmanagement.dto.response.RoomResponse;
import com.motelmanagement.enums.RoomStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoomService {
    PageResponse<RoomResponse> getRooms(String search, Long buildingId, RoomStatus status, Pageable pageable);
    List<RoomResponse> getAllRooms();
    List<RoomResponse> getAvailableRooms();
    RoomResponse getRoomById(Long id);
    RoomResponse createRoom(RoomRequest request);
    RoomResponse updateRoom(Long id, RoomRequest request);
    RoomResponse assignServicesToRoom(Long roomId, RoomServiceAssignRequest request);
    void deleteRoom(Long id);
}
