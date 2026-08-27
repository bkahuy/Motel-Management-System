package com.motelmanagement.config;

import com.motelmanagement.entity.*;
import com.motelmanagement.enums.*;
import com.motelmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final ServiceRepository serviceRepository;
    private final TenantRepository tenantRepository;
    private final ContractRepository contractRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing system database seed data...");

        // 1. Roles
        Role adminRole = createRoleIfNotFound(RoleName.ROLE_ADMIN, "Quản trị viên toàn quyền hệ thống");
        Role staffRole = createRoleIfNotFound(RoleName.ROLE_STAFF, "Nhân viên vận hành tòa nhà");
        Role tenantRole = createRoleIfNotFound(RoleName.ROLE_TENANT, "Khách thuê phòng");

        // 2. Users
        User adminUser = createUserIfNotFound(
                "admin", "admin@example.com", "Admin@123", "Quản Trị Viên Hệ Thống", "0988888888", adminRole
        );
        User staffUser = createUserIfNotFound(
                "staff", "staff@example.com", "Staff@123", "Nguyễn Nhân Viên", "0977777777", staffRole
        );
        User tenantUser1 = createUserIfNotFound(
                "tenant1", "tenant1@example.com", "Tenant@123", "Nguyễn Văn An", "0987654321", tenantRole
        );
        User tenantUser2 = createUserIfNotFound(
                "tenant2", "tenant2@example.com", "Tenant@123", "Trần Thị Bích", "0912345678", tenantRole
        );

        // 3. Services
        Service internet = createServiceIfNotFound("Internet Cáp Quang tốc độ cao", new BigDecimal("100000"), "phòng/tháng", "WiFi cáp quang FPT 150Mbps");
        Service cleaning = createServiceIfNotFound("Vệ sinh hành lang & rác", new BigDecimal("50000"), "người/tháng", "Thu gom rác và quét dọn hàng ngày");
        Service parking = createServiceIfNotFound("Gửi xe máy", new BigDecimal("100000"), "xe/tháng", "Chỗ để xe máy có camera an ninh 24/7");
        Service electricity = createServiceIfNotFound("Điện sinh hoạt", new BigDecimal("3500"), "kWh", "Điện công tơ riêng từng phòng");
        Service water = createServiceIfNotFound("Nước sinh hoạt", new BigDecimal("25000"), "khối (m3)", "Nước máy sạch công tơ riêng");

        Set<Service> roomServicesSet = new HashSet<>(Arrays.asList(internet, cleaning, parking));

        // 4. Buildings
        Building buildingA = createBuildingIfNotFound(
                "Sunshine Tower", "123 Đường Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
                "Tòa nhà 5 tầng cao cấp, thang máy, camera an ninh 24/7, khóa cổng vân tay.", 5
        );

        Building buildingB = createBuildingIfNotFound(
                "Green House", "45 Đường Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội",
                "Khu nhà trọ 4 tầng thoáng mát, có ban công riêng từng phòng, gần các trường đại học.", 4
        );

        // 5. Rooms
        Room room101 = createRoomIfNotFound(buildingA, "P101", new BigDecimal("3500000"), new BigDecimal("25.5"), 2, new BigDecimal("3500000"), RoomStatus.OCCUPIED, "Phòng tầng 1, khép kín, có điều hòa, bình nóng lạnh, tủ lạnh, giường tủ.", roomServicesSet);
        Room room102 = createRoomIfNotFound(buildingA, "P102", new BigDecimal("4000000"), new BigDecimal("30.0"), 3, new BigDecimal("4000000"), RoomStatus.OCCUPIED, "Phòng tầng 1 góc 2 mặt thoáng, ban công rộng, full nội thất.", roomServicesSet);
        Room room201 = createRoomIfNotFound(buildingA, "P201", new BigDecimal("3800000"), new BigDecimal("28.0"), 2, new BigDecimal("3800000"), RoomStatus.AVAILABLE, "Phòng tầng 2 ban công thoáng mát, đầy đủ nội thất.", roomServicesSet);
        Room room202 = createRoomIfNotFound(buildingA, "P202", new BigDecimal("3800000"), new BigDecimal("28.0"), 2, new BigDecimal("3800000"), RoomStatus.MAINTENANCE, "Phòng tầng 2 đang bảo trì điều hòa và sơn lại tường.", roomServicesSet);

        Room roomB101 = createRoomIfNotFound(buildingB, "P101", new BigDecimal("2800000"), new BigDecimal("20.0"), 2, new BigDecimal("2800000"), RoomStatus.AVAILABLE, "Phòng tầng 1 khu Green House, gác xép, kệ bếp nấu ăn riêng.", Collections.singleton(internet));
        Room roomB102 = createRoomIfNotFound(buildingB, "P102", new BigDecimal("3000000"), new BigDecimal("22.0"), 2, new BigDecimal("3000000"), RoomStatus.AVAILABLE, "Phòng tầng 1 khu Green House, cửa sổ lớn đón ánh sáng tự nhiên.", Collections.singleton(internet));

        // 6. Tenants
        Tenant tenant1 = createTenantIfNotFound(
                "Nguyễn Văn An", "001200001234", LocalDate.of(1998, 5, 15), "Nam",
                "0987654321", "tenant1@example.com", "Vĩnh Yên, Vĩnh Phúc", "Kỹ sư phần mềm", tenantUser1
        );

        Tenant tenant2 = createTenantIfNotFound(
                "Trần Thị Bích", "001200005678", LocalDate.of(2001, 8, 20), "Nữ",
                "0912345678", "tenant2@example.com", "TP. Nam Định, Nam Định", "Chuyên viên Marketing", tenantUser2
        );

        // 7. Contracts
        Contract contract1 = createContractIfNotFound(
                "HD-202601-P101", room101, tenant1,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31),
                new BigDecimal("3500000"), new BigDecimal("3500000"), PaymentCycle.MONTHLY,
                ContractStatus.ACTIVE, "Hợp đồng thuê 1 năm, đóng tiền mùng 5 hàng tháng"
        );

        Contract contract2 = createContractIfNotFound(
                "HD-202601-P102", room102, tenant2,
                LocalDate.of(2026, 2, 1), LocalDate.of(2027, 1, 31),
                new BigDecimal("4000000"), new BigDecimal("4000000"), PaymentCycle.MONTHLY,
                ContractStatus.ACTIVE, "Hợp đồng thuê 1 năm"
        );

        // 8. Meter Readings
        createMeterReadingIfNotFound(contract1, "2026-07", 120, 195, 30, 38, LocalDate.of(2026, 7, 30), "Chỉ số tháng 7");
        createMeterReadingIfNotFound(contract1, "2026-08", 195, 270, 38, 47, LocalDate.of(2026, 8, 25), "Chỉ số tháng 8");

        createMeterReadingIfNotFound(contract2, "2026-07", 80, 150, 20, 27, LocalDate.of(2026, 7, 30), "Chỉ số tháng 7");
        createMeterReadingIfNotFound(contract2, "2026-08", 150, 235, 27, 36, LocalDate.of(2026, 8, 25), "Chỉ số tháng 8");

        // 9. Invoices & Payments (July - Paid, August - Unpaid)
        createSampleInvoiceAndPayment(contract1, "2026-07", new BigDecimal("3500000"), 75, 8, new BigDecimal("250000"), InvoiceStatus.PAID);
        createSampleInvoiceAndPayment(contract1, "2026-08", new BigDecimal("3500000"), 75, 9, new BigDecimal("250000"), InvoiceStatus.UNPAID);

        createSampleInvoiceAndPayment(contract2, "2026-07", new BigDecimal("4000000"), 70, 7, new BigDecimal("250000"), InvoiceStatus.PAID);
        createSampleInvoiceAndPayment(contract2, "2026-08", new BigDecimal("4000000"), 85, 9, new BigDecimal("250000"), InvoiceStatus.UNPAID);

        log.info("Database initialization completed successfully!");
    }

    private Role createRoleIfNotFound(RoleName name, String description) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = Role.builder().name(name).description(description).build();
            return roleRepository.save(role);
        });
    }

    private User createUserIfNotFound(String username, String email, String rawPassword, String fullName, String phone, Role role) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .active(true)
                    .build();
            return userRepository.save(user);
        });
    }

    private Service createServiceIfNotFound(String name, BigDecimal price, String unit, String description) {
        return serviceRepository.findByName(name).orElseGet(() -> {
            Service service = Service.builder()
                    .name(name)
                    .price(price)
                    .unit(unit)
                    .description(description)
                    .active(true)
                    .build();
            return serviceRepository.save(service);
        });
    }

    private Building createBuildingIfNotFound(String name, String address, String description, int totalFloors) {
        return buildingRepository.findByName(name).orElseGet(() -> {
            Building building = Building.builder()
                    .name(name)
                    .address(address)
                    .description(description)
                    .totalFloors(totalFloors)
                    .build();
            return buildingRepository.save(building);
        });
    }

    private Room createRoomIfNotFound(
            Building building, String roomNumber, BigDecimal price, BigDecimal area,
            int maxOccupants, BigDecimal deposit, RoomStatus status, String description,
            Set<Service> services
    ) {
        return roomRepository.findByBuildingIdAndRoomNumber(building.getId(), roomNumber).orElseGet(() -> {
            Room room = Room.builder()
                    .building(building)
                    .roomNumber(roomNumber)
                    .price(price)
                    .area(area)
                    .maxOccupants(maxOccupants)
                    .deposit(deposit)
                    .status(status)
                    .description(description)
                    .services(new HashSet<>(services))
                    .build();
            return roomRepository.save(room);
        });
    }

    private Tenant createTenantIfNotFound(
            String fullName, String identityNumber, LocalDate dob, String gender,
            String phone, String email, String address, String occupation, User user
    ) {
        return tenantRepository.findByIdentityNumber(identityNumber).orElseGet(() -> {
            Tenant tenant = Tenant.builder()
                    .fullName(fullName)
                    .identityNumber(identityNumber)
                    .dateOfBirth(dob)
                    .gender(gender)
                    .phone(phone)
                    .email(email)
                    .address(address)
                    .occupation(occupation)
                    .user(user)
                    .build();
            return tenantRepository.save(tenant);
        });
    }

    private Contract createContractIfNotFound(
            String contractCode, Room room, Tenant tenant, LocalDate startDate, LocalDate endDate,
            BigDecimal rentPrice, BigDecimal deposit, PaymentCycle cycle, ContractStatus status, String notes
    ) {
        return contractRepository.findByContractCode(contractCode).orElseGet(() -> {
            Contract contract = Contract.builder()
                    .contractCode(contractCode)
                    .room(room)
                    .tenant(tenant)
                    .startDate(startDate)
                    .endDate(endDate)
                    .rentPrice(rentPrice)
                    .deposit(deposit)
                    .paymentCycle(cycle)
                    .status(status)
                    .notes(notes)
                    .build();
            return contractRepository.save(contract);
        });
    }

    private void createMeterReadingIfNotFound(
            Contract contract, String month, int elecPrev, int elecCurr,
            int waterPrev, int waterCurr, LocalDate readingDate, String notes
    ) {
        if (!meterReadingRepository.existsByContractIdAndReadingMonth(contract.getId(), month)) {
            MeterReading reading = MeterReading.builder()
                    .contract(contract)
                    .readingMonth(month)
                    .electricityPrevious(elecPrev)
                    .electricityCurrent(elecCurr)
                    .waterPrevious(waterPrev)
                    .waterCurrent(waterCurr)
                    .readingDate(readingDate)
                    .notes(notes)
                    .build();
            meterReadingRepository.save(reading);
        }
    }

    private void createSampleInvoiceAndPayment(
            Contract contract, String billingMonth, BigDecimal roomFee,
            int elecUsage, int waterUsage, BigDecimal serviceFee, InvoiceStatus status
    ) {
        if (invoiceRepository.existsByContractIdAndBillingMonth(contract.getId(), billingMonth)) {
            return;
        }

        BigDecimal electricityPrice = new BigDecimal("3500");
        BigDecimal waterPrice = new BigDecimal("25000");

        BigDecimal electricityFee = electricityPrice.multiply(BigDecimal.valueOf(elecUsage));
        BigDecimal waterFee = waterPrice.multiply(BigDecimal.valueOf(waterUsage));
        BigDecimal totalAmount = roomFee.add(electricityFee).add(waterFee).add(serviceFee);

        String monthFormatted = billingMonth.replace("-", "");
        String roomNumber = contract.getRoom().getRoomNumber().replaceAll("[^a-zA-Z0-9]", "");
        String invoiceCode = "INV-" + monthFormatted + "-" + roomNumber;

        LocalDate dueDate = LocalDate.parse(billingMonth + "-10");

        Invoice invoice = Invoice.builder()
                .invoiceCode(invoiceCode)
                .contract(contract)
                .billingMonth(billingMonth)
                .roomFee(roomFee)
                .electricityFee(electricityFee)
                .waterFee(waterFee)
                .serviceFee(serviceFee)
                .otherFee(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .dueDate(dueDate)
                .status(status)
                .notes("Hóa đơn tiền phòng & dịch vụ tháng " + billingMonth)
                .build();

        invoice.addItem(InvoiceItem.builder()
                .itemType(InvoiceItemType.ROOM_FEE)
                .description("Tiền thuê phòng tháng " + billingMonth)
                .quantity(BigDecimal.ONE)
                .unitPrice(roomFee)
                .amount(roomFee)
                .build());

        invoice.addItem(InvoiceItem.builder()
                .itemType(InvoiceItemType.ELECTRICITY)
                .description("Tiền điện (" + elecUsage + " kWh x 3.500 đ)")
                .quantity(BigDecimal.valueOf(elecUsage))
                .unitPrice(electricityPrice)
                .amount(electricityFee)
                .build());

        invoice.addItem(InvoiceItem.builder()
                .itemType(InvoiceItemType.WATER)
                .description("Tiền nước (" + waterUsage + " m3 x 25.000 đ)")
                .quantity(BigDecimal.valueOf(waterUsage))
                .unitPrice(waterPrice)
                .amount(waterFee)
                .build());

        invoice.addItem(InvoiceItem.builder()
                .itemType(InvoiceItemType.SERVICE)
                .description("Gói dịch vụ chung (WiFi, Vệ sinh, Gửi xe)")
                .quantity(BigDecimal.ONE)
                .unitPrice(serviceFee)
                .amount(serviceFee)
                .build());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        if (status == InvoiceStatus.PAID) {
            Payment payment = Payment.builder()
                    .invoice(savedInvoice)
                    .amount(totalAmount)
                    .paymentMethod(PaymentMethod.BANK_TRANSFER)
                    .paymentDate(LocalDateTime.now().minusDays(20))
                    .transactionCode("TXN-SEED-" + savedInvoice.getId())
                    .status(PaymentStatus.COMPLETED)
                    .notes("Chuyển khoản thanh toán tiền phòng qua MBBank")
                    .build();
            paymentRepository.save(payment);
        }
    }
}
