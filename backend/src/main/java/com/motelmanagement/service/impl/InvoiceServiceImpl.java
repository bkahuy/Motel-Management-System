package com.motelmanagement.service.impl;

import com.motelmanagement.dto.request.InvoiceCalculateRequest;
import com.motelmanagement.dto.request.InvoiceCreateRequest;
import com.motelmanagement.dto.response.*;
import com.motelmanagement.entity.*;
import com.motelmanagement.enums.InvoiceItemType;
import com.motelmanagement.enums.InvoiceStatus;
import com.motelmanagement.enums.PaymentStatus;
import com.motelmanagement.enums.RoleName;
import com.motelmanagement.exception.BadRequestException;
import com.motelmanagement.exception.DuplicateResourceException;
import com.motelmanagement.exception.ResourceNotFoundException;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.MeterReadingRepository;
import com.motelmanagement.repository.ServiceRepository;
import com.motelmanagement.security.UserPrincipal;
import com.motelmanagement.service.InvoiceService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceServiceImpl.class);

    private static final BigDecimal DEFAULT_ELECTRICITY_PRICE = new BigDecimal("3500");
    private static final BigDecimal DEFAULT_WATER_PRICE = new BigDecimal("25000");

    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final ServiceRepository serviceRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InvoiceResponse> getInvoices(
            String search,
            String billingMonth,
            InvoiceStatus status,
            Long roomId,
            UserPrincipal currentUser,
            Pageable pageable
    ) {
        Specification<Invoice> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<Invoice, Contract> contractJoin = root.join("contract", JoinType.LEFT);
            Join<Contract, Room> roomJoin = contractJoin.join("room", JoinType.LEFT);
            Join<Contract, Tenant> tenantJoin = contractJoin.join("tenant", JoinType.LEFT);

            if (currentUser != null && currentUser.getRole() == RoleName.ROLE_TENANT) {
                predicates.add(cb.equal(tenantJoin.get("user").get("id"), currentUser.getId()));
            }

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("invoiceCode")), searchLike),
                        cb.like(cb.lower(roomJoin.get("roomNumber")), searchLike),
                        cb.like(cb.lower(tenantJoin.get("fullName")), searchLike),
                        cb.like(cb.lower(tenantJoin.get("phone")), searchLike)
                ));
            }

            if (StringUtils.hasText(billingMonth)) {
                predicates.add(cb.equal(root.get("billingMonth"), billingMonth));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (roomId != null) {
                predicates.add(cb.equal(roomJoin.get("id"), roomId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Invoice> page = invoiceRepository.findAll(spec, pageable);
        List<InvoiceResponse> content = page.getContent().stream()
                .map(this::mapToInvoiceResponse)
                .collect(Collectors.toList());

        return PageResponse.of(page, content);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id, UserPrincipal currentUser) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));

        if (currentUser != null && currentUser.getRole() == RoleName.ROLE_TENANT) {
            Contract contract = invoice.getContract();
            if (contract == null || contract.getTenant() == null || contract.getTenant().getUser() == null
                    || !contract.getTenant().getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Bạn không có quyền xem hóa đơn này");
            }
        }

        return mapToInvoiceResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceCalculateResponse calculatePreview(InvoiceCalculateRequest request) {
        Contract contract = contractRepository.findByIdWithDetails(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));

        Room room = contract.getRoom();
        Tenant tenant = contract.getTenant();

        // 1. Room Fee
        BigDecimal roomFee = contract.getRentPrice();

        // 2. Meter Reading
        Optional<MeterReading> readingOpt = meterReadingRepository
                .findByContractIdAndReadingMonth(contract.getId(), request.getBillingMonth());

        int elecPrev = 0, elecCurr = 0, elecUsage = 0;
        int waterPrev = 0, waterCurr = 0, waterUsage = 0;

        if (readingOpt.isPresent()) {
            MeterReading r = readingOpt.get();
            elecPrev = r.getElectricityPrevious();
            elecCurr = r.getElectricityCurrent();
            elecUsage = r.getElectricityUsage();
            waterPrev = r.getWaterPrevious();
            waterCurr = r.getWaterCurrent();
            waterUsage = r.getWaterUsage();
        }

        BigDecimal electricityPrice = request.getElectricityUnitPrice() != null ?
                request.getElectricityUnitPrice() : DEFAULT_ELECTRICITY_PRICE;
        BigDecimal waterPrice = request.getWaterUnitPrice() != null ?
                request.getWaterUnitPrice() : DEFAULT_WATER_PRICE;

        BigDecimal electricityFee = electricityPrice.multiply(BigDecimal.valueOf(elecUsage));
        BigDecimal waterFee = waterPrice.multiply(BigDecimal.valueOf(waterUsage));

        // 3. Service Fee
        BigDecimal serviceFee = BigDecimal.ZERO;
        List<InvoiceItemResponse> serviceItems = new ArrayList<>();
        if (room != null && room.getServices() != null) {
            for (var s : room.getServices()) {
                if (s.isActive()) {
                    serviceFee = serviceFee.add(s.getPrice());
                    serviceItems.add(InvoiceItemResponse.builder()
                            .itemType(InvoiceItemType.SERVICE)
                            .description(s.getName() + " (" + s.getUnit() + ")")
                            .quantity(BigDecimal.ONE)
                            .unitPrice(s.getPrice())
                            .amount(s.getPrice())
                            .build());
                }
            }
        }

        // 4. Other Fee
        BigDecimal otherFee = request.getOtherFee() != null ? request.getOtherFee() : BigDecimal.ZERO;

        // 5. Total
        BigDecimal totalAmount = roomFee.add(electricityFee).add(waterFee).add(serviceFee).add(otherFee);

        return InvoiceCalculateResponse.builder()
                .contractId(contract.getId())
                .contractCode(contract.getContractCode())
                .roomNumber(room != null ? room.getRoomNumber() : "")
                .tenantName(tenant != null ? tenant.getFullName() : "")
                .billingMonth(request.getBillingMonth())
                .roomFee(roomFee)
                .electricityPrevious(elecPrev)
                .electricityCurrent(elecCurr)
                .electricityUsage(elecUsage)
                .electricityUnitPrice(electricityPrice)
                .electricityFee(electricityFee)
                .waterPrevious(waterPrev)
                .waterCurrent(waterCurr)
                .waterUsage(waterUsage)
                .waterUnitPrice(waterPrice)
                .waterFee(waterFee)
                .serviceFee(serviceFee)
                .serviceItems(serviceItems)
                .otherFee(otherFee)
                .totalAmount(totalAmount)
                .build();
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
        Contract contract = contractRepository.findByIdWithDetails(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));

        if (invoiceRepository.existsByContractIdAndBillingMonth(contract.getId(), request.getBillingMonth())) {
            throw new DuplicateResourceException(
                    String.format("Đã tồn tại hóa đơn tháng %s cho hợp đồng %s",
                            request.getBillingMonth(), contract.getContractCode())
            );
        }

        Room room = contract.getRoom();
        if (room == null) {
            throw new BadRequestException("Hợp đồng chưa được gán phòng");
        }

        // 1. Room Fee
        BigDecimal roomFee = contract.getRentPrice();

        // 2. Meter Reading & Fees
        Optional<MeterReading> readingOpt = meterReadingRepository
                .findByContractIdAndReadingMonth(contract.getId(), request.getBillingMonth());

        int elecUsage = readingOpt.map(MeterReading::getElectricityUsage).orElse(0);
        int waterUsage = readingOpt.map(MeterReading::getWaterUsage).orElse(0);

        BigDecimal electricityPrice = request.getElectricityUnitPrice() != null ?
                request.getElectricityUnitPrice() : DEFAULT_ELECTRICITY_PRICE;
        BigDecimal waterPrice = request.getWaterUnitPrice() != null ?
                request.getWaterUnitPrice() : DEFAULT_WATER_PRICE;

        BigDecimal electricityFee = electricityPrice.multiply(BigDecimal.valueOf(elecUsage));
        BigDecimal waterFee = waterPrice.multiply(BigDecimal.valueOf(waterUsage));

        // 3. Service Fee
        BigDecimal serviceFee = BigDecimal.ZERO;
        List<InvoiceItem> items = new ArrayList<>();

        // Add Room Fee item
        items.add(InvoiceItem.builder()
                .itemType(InvoiceItemType.ROOM_FEE)
                .description("Tiền thuê phòng tháng " + request.getBillingMonth())
                .quantity(BigDecimal.ONE)
                .unitPrice(roomFee)
                .amount(roomFee)
                .build());

        // Add Electricity item
        items.add(InvoiceItem.builder()
                .itemType(InvoiceItemType.ELECTRICITY)
                .description("Tiền điện (" + elecUsage + " kWh x " + electricityPrice.toPlainString() + " đ)")
                .quantity(BigDecimal.valueOf(elecUsage))
                .unitPrice(electricityPrice)
                .amount(electricityFee)
                .build());

        // Add Water item
        items.add(InvoiceItem.builder()
                .itemType(InvoiceItemType.WATER)
                .description("Tiền nước (" + waterUsage + " m3 x " + waterPrice.toPlainString() + " đ)")
                .quantity(BigDecimal.valueOf(waterUsage))
                .unitPrice(waterPrice)
                .amount(waterFee)
                .build());

        // Add Service items
        if (room.getServices() != null) {
            for (var s : room.getServices()) {
                if (s.isActive()) {
                    serviceFee = serviceFee.add(s.getPrice());
                    items.add(InvoiceItem.builder()
                            .itemType(InvoiceItemType.SERVICE)
                            .description(s.getName() + " (" + s.getUnit() + ")")
                            .quantity(BigDecimal.ONE)
                            .unitPrice(s.getPrice())
                            .amount(s.getPrice())
                            .build());
                }
            }
        }

        // 4. Other Fee
        BigDecimal otherFee = request.getOtherFee() != null ? request.getOtherFee() : BigDecimal.ZERO;
        if (otherFee.compareTo(BigDecimal.ZERO) != 0) {
            String desc = StringUtils.hasText(request.getOtherFeeDescription()) ?
                    request.getOtherFeeDescription() : "Phụ phí / Chi phí khác";
            items.add(InvoiceItem.builder()
                    .itemType(InvoiceItemType.OTHER)
                    .description(desc)
                    .quantity(BigDecimal.ONE)
                    .unitPrice(otherFee)
                    .amount(otherFee)
                    .build());
        }

        // 5. Total
        BigDecimal totalAmount = roomFee.add(electricityFee).add(waterFee).add(serviceFee).add(otherFee);

        // Generate Invoice Code: INV-YYYYMM-ROOMNO
        String monthFormatted = request.getBillingMonth().replace("-", "");
        String cleanRoomNumber = room.getRoomNumber().replaceAll("[^a-zA-Z0-9]", "");
        String invoiceCode = "INV-" + monthFormatted + "-" + cleanRoomNumber;

        int suffix = 1;
        while (invoiceRepository.existsByInvoiceCode(invoiceCode)) {
            invoiceCode = "INV-" + monthFormatted + "-" + cleanRoomNumber + "-" + suffix++;
        }

        Invoice invoice = Invoice.builder()
                .invoiceCode(invoiceCode)
                .contract(contract)
                .billingMonth(request.getBillingMonth())
                .roomFee(roomFee)
                .electricityFee(electricityFee)
                .waterFee(waterFee)
                .serviceFee(serviceFee)
                .otherFee(otherFee)
                .totalAmount(totalAmount)
                .dueDate(request.getDueDate())
                .status(InvoiceStatus.UNPAID)
                .notes(request.getNotes())
                .build();

        for (InvoiceItem item : items) {
            invoice.addItem(item);
        }

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Created invoice: {} for contract: {} in month: {}",
                saved.getInvoiceCode(), contract.getContractCode(), saved.getBillingMonth());

        return mapToInvoiceResponse(saved);
    }

    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Không thể xóa hóa đơn đã thanh toán");
        }

        invoiceRepository.delete(invoice);
        log.info("Deleted invoice id: {}", id);
    }

    private InvoiceResponse mapToInvoiceResponse(Invoice invoice) {
        Contract contract = invoice.getContract();
        Room room = contract != null ? contract.getRoom() : null;
        Tenant tenant = contract != null ? contract.getTenant() : null;

        List<InvoiceItemResponse> itemResponses = invoice.getItems() != null ?
                invoice.getItems().stream()
                        .map(item -> InvoiceItemResponse.builder()
                                .id(item.getId())
                                .itemType(item.getItemType())
                                .description(item.getDescription())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .amount(item.getAmount())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>();

        List<PaymentResponse> paymentResponses = invoice.getPayments() != null ?
                invoice.getPayments().stream()
                        .map(p -> PaymentResponse.builder()
                                .id(p.getId())
                                .invoiceId(invoice.getId())
                                .invoiceCode(invoice.getInvoiceCode())
                                .roomNumber(room != null ? room.getRoomNumber() : null)
                                .tenantName(tenant != null ? tenant.getFullName() : null)
                                .billingMonth(invoice.getBillingMonth())
                                .amount(p.getAmount())
                                .paymentMethod(p.getPaymentMethod())
                                .paymentDate(p.getPaymentDate())
                                .transactionCode(p.getTransactionCode())
                                .status(p.getStatus())
                                .notes(p.getNotes())
                                .createdAt(p.getCreatedAt())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>();

        BigDecimal paidAmount = invoice.getPayments() != null ?
                invoice.getPayments().stream()
                        .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                        .map(Payment::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;

        BigDecimal remainingAmount = invoice.getTotalAmount().subtract(paidAmount);
        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        // Auto update status to OVERDUE if unpaid and passed due date
        InvoiceStatus status = invoice.getStatus();
        if (status == InvoiceStatus.UNPAID && LocalDate.now().isAfter(invoice.getDueDate())) {
            status = InvoiceStatus.OVERDUE;
        }

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceCode(invoice.getInvoiceCode())
                .contractId(contract != null ? contract.getId() : null)
                .contractCode(contract != null ? contract.getContractCode() : null)
                .roomId(room != null ? room.getId() : null)
                .roomNumber(room != null ? room.getRoomNumber() : null)
                .buildingName(room != null && room.getBuilding() != null ? room.getBuilding().getName() : null)
                .tenantId(tenant != null ? tenant.getId() : null)
                .tenantName(tenant != null ? tenant.getFullName() : null)
                .tenantPhone(tenant != null ? tenant.getPhone() : null)
                .billingMonth(invoice.getBillingMonth())
                .roomFee(invoice.getRoomFee())
                .electricityFee(invoice.getElectricityFee())
                .waterFee(invoice.getWaterFee())
                .serviceFee(invoice.getServiceFee())
                .otherFee(invoice.getOtherFee())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(paidAmount)
                .remainingAmount(remainingAmount)
                .dueDate(invoice.getDueDate())
                .status(status)
                .notes(invoice.getNotes())
                .items(itemResponses)
                .payments(paymentResponses)
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}
