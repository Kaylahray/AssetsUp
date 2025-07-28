import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { MobileDevice, MobileDeviceStatus } from "./entities/mobile-device.entity";
import { CreateMobileDeviceDto } from "./dto/create-mobile-device.dto";
import { UpdateMobileDeviceDto } from "./dto/update-mobile-device.dto";
import { QueryMobileDeviceDto } from "./dto/query-mobile-device.dto";

@Injectable()
export class MobileDevicesService {
  constructor(
    @InjectRepository(MobileDevice)
    private mobileDeviceRepository: Repository<MobileDevice>,
  ) {}

  async create(createMobileDeviceDto: CreateMobileDeviceDto): Promise<MobileDevice> {
    // Check if IMEI already exists
    const existingImei = await this.mobileDeviceRepository.findOne({
      where: { imei: createMobileDeviceDto.imei },
    });
    if (existingImei) {
      throw new ConflictException("Device with this IMEI already exists");
    }

    // Check if serial number already exists
    const existingSerial = await this.mobileDeviceRepository.findOne({
      where: { serialNumber: createMobileDeviceDto.serialNumber },
    });
    if (existingSerial) {
      throw new ConflictException("Device with this serial number already exists");
    }

    const mobileDevice = this.mobileDeviceRepository.create(createMobileDeviceDto);
    return this.mobileDeviceRepository.save(mobileDevice);
  }

  async findAll(queryDto: QueryMobileDeviceDto) {
    const {
      search,
      status,
      deviceType,
      operatingSystem,
      assignedUserId,
      department,
      location,
      manufacturer,
      model,
      warrantyExpiryBefore,
      warrantyExpiryAfter,
      insuranceExpiryBefore,
      insuranceExpiryAfter,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = queryDto;

    const queryBuilder = this.mobileDeviceRepository
      .createQueryBuilder("device")
      .leftJoinAndSelect("device.assignedUser", "assignedUser");

    // Search functionality
    if (search) {
      queryBuilder.andWhere(
        "(device.name ILIKE :search OR device.model ILIKE :search OR device.manufacturer ILIKE :search OR device.imei ILIKE :search OR device.serialNumber ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere("device.status = :status", { status });
    }

    // Filter by device type
    if (deviceType) {
      queryBuilder.andWhere("device.deviceType = :deviceType", { deviceType });
    }

    // Filter by operating system
    if (operatingSystem) {
      queryBuilder.andWhere("device.operatingSystem = :operatingSystem", { operatingSystem });
    }

    // Filter by assigned user
    if (assignedUserId) {
      queryBuilder.andWhere("device.assignedUserId = :assignedUserId", { assignedUserId });
    }

    // Filter by department
    if (department) {
      queryBuilder.andWhere("device.department = :department", { department });
    }

    // Filter by location
    if (location) {
      queryBuilder.andWhere("device.location = :location", { location });
    }

    // Filter by manufacturer
    if (manufacturer) {
      queryBuilder.andWhere("device.manufacturer = :manufacturer", { manufacturer });
    }

    // Filter by model
    if (model) {
      queryBuilder.andWhere("device.model = :model", { model });
    }

    // Filter by warranty expiry
    if (warrantyExpiryBefore || warrantyExpiryAfter) {
      if (warrantyExpiryBefore && warrantyExpiryAfter) {
        queryBuilder.andWhere("device.warrantyExpiry BETWEEN :warrantyStart AND :warrantyEnd", {
          warrantyStart: warrantyExpiryAfter,
          warrantyEnd: warrantyExpiryBefore,
        });
      } else if (warrantyExpiryBefore) {
        queryBuilder.andWhere("device.warrantyExpiry <= :warrantyBefore", {
          warrantyBefore: warrantyExpiryBefore,
        });
      } else if (warrantyExpiryAfter) {
        queryBuilder.andWhere("device.warrantyExpiry >= :warrantyAfter", {
          warrantyAfter: warrantyExpiryAfter,
        });
      }
    }

    // Filter by insurance expiry
    if (insuranceExpiryBefore || insuranceExpiryAfter) {
      if (insuranceExpiryBefore && insuranceExpiryAfter) {
        queryBuilder.andWhere("device.insuranceExpiry BETWEEN :insuranceStart AND :insuranceEnd", {
          insuranceStart: insuranceExpiryAfter,
          insuranceEnd: insuranceExpiryBefore,
        });
      } else if (insuranceExpiryBefore) {
        queryBuilder.andWhere("device.insuranceExpiry <= :insuranceBefore", {
          insuranceBefore: insuranceExpiryBefore,
        });
      } else if (insuranceExpiryAfter) {
        queryBuilder.andWhere("device.insuranceExpiry >= :insuranceAfter", {
          insuranceAfter: insuranceExpiryAfter,
        });
      }
    }

    // Sorting
    queryBuilder.orderBy(`device.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [devices, total] = await queryBuilder.getManyAndCount();

    return {
      devices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<MobileDevice> {
    const device = await this.mobileDeviceRepository.findOne({
      where: { id },
      relations: ["assignedUser"],
    });

    if (!device) {
      throw new NotFoundException(`Mobile device with ID ${id} not found`);
    }

    return device;
  }

  async findByImei(imei: string): Promise<MobileDevice> {
    const device = await this.mobileDeviceRepository.findOne({
      where: { imei },
      relations: ["assignedUser"],
    });

    if (!device) {
      throw new NotFoundException(`Mobile device with IMEI ${imei} not found`);
    }

    return device;
  }

  async findBySerialNumber(serialNumber: string): Promise<MobileDevice> {
    const device = await this.mobileDeviceRepository.findOne({
      where: { serialNumber },
      relations: ["assignedUser"],
    });

    if (!device) {
      throw new NotFoundException(`Mobile device with serial number ${serialNumber} not found`);
    }

    return device;
  }

  async update(id: string, updateMobileDeviceDto: UpdateMobileDeviceDto): Promise<MobileDevice> {
    const device = await this.findOne(id);

    // Check for IMEI conflicts if IMEI is being updated
    if (updateMobileDeviceDto.imei && updateMobileDeviceDto.imei !== device.imei) {
      const existingImei = await this.mobileDeviceRepository.findOne({
        where: { imei: updateMobileDeviceDto.imei },
      });
      if (existingImei) {
        throw new ConflictException("Device with this IMEI already exists");
      }
    }

    // Check for serial number conflicts if serial number is being updated
    if (updateMobileDeviceDto.serialNumber && updateMobileDeviceDto.serialNumber !== device.serialNumber) {
      const existingSerial = await this.mobileDeviceRepository.findOne({
        where: { serialNumber: updateMobileDeviceDto.serialNumber },
      });
      if (existingSerial) {
        throw new ConflictException("Device with this serial number already exists");
      }
    }

    Object.assign(device, updateMobileDeviceDto);
    return this.mobileDeviceRepository.save(device);
  }

  async decommission(id: string, reason: string, decommissionedBy: string): Promise<MobileDevice> {
    const device = await this.findOne(id);

    if (device.status === MobileDeviceStatus.DECOMMISSIONED) {
      throw new BadRequestException("Device is already decommissioned");
    }

    device.status = MobileDeviceStatus.DECOMMISSIONED;
    device.decommissionDate = new Date();
    device.decommissionReason = reason;
    device.decommissionedBy = decommissionedBy;

    // Unassign user if device was assigned
    if (device.assignedUserId) {
      device.assignedUserId = null;
      device.assignedUser = null;
      device.returnDate = new Date();
    }

    return this.mobileDeviceRepository.save(device);
  }

  async assignToUser(id: string, userId: string, notes?: string): Promise<MobileDevice> {
    const device = await this.findOne(id);

    if (device.status === MobileDeviceStatus.DECOMMISSIONED) {
      throw new BadRequestException("Cannot assign a decommissioned device");
    }

    if (device.status === MobileDeviceStatus.MAINTENANCE) {
      throw new BadRequestException("Cannot assign a device under maintenance");
    }

    device.assignedUserId = userId;
    device.assignedDate = new Date();
    device.status = MobileDeviceStatus.ASSIGNED;
    device.assignmentNotes = notes;

    return this.mobileDeviceRepository.save(device);
  }

  async unassignFromUser(id: string): Promise<MobileDevice> {
    const device = await this.findOne(id);

    if (!device.assignedUserId) {
      throw new BadRequestException("Device is not assigned to any user");
    }

    device.assignedUserId = null;
    device.assignedUser = null;
    device.returnDate = new Date();
    device.status = MobileDeviceStatus.AVAILABLE;
    device.assignmentNotes = null;

    return this.mobileDeviceRepository.save(device);
  }

  async updateOsVersion(id: string, newOsVersion: string): Promise<MobileDevice> {
    const device = await this.findOne(id);

    device.currentOsVersion = newOsVersion;
    device.lastOsUpdate = new Date();
    device.isOsUpdateAvailable = false;
    device.availableOsVersion = null;

    return this.mobileDeviceRepository.save(device);
  }

  async markOsUpdateAvailable(id: string, availableVersion: string): Promise<MobileDevice> {
    const device = await this.findOne(id);

    device.isOsUpdateAvailable = true;
    device.availableOsVersion = availableVersion;

    return this.mobileDeviceRepository.save(device);
  }

  async getDevicesWithExpiringWarranty(daysThreshold: number = 30): Promise<MobileDevice[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.mobileDeviceRepository.find({
      where: {
        warrantyExpiry: LessThanOrEqual(thresholdDate),
        status: MobileDeviceStatus.AVAILABLE,
      },
    });
  }

  async getDevicesWithExpiringInsurance(daysThreshold: number = 30): Promise<MobileDevice[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.mobileDeviceRepository.find({
      where: {
        insuranceExpiry: LessThanOrEqual(thresholdDate),
        status: MobileDeviceStatus.AVAILABLE,
      },
    });
  }

  async getDevicesNeedingOsUpdate(): Promise<MobileDevice[]> {
    return this.mobileDeviceRepository.find({
      where: {
        isOsUpdateAvailable: true,
        status: MobileDeviceStatus.AVAILABLE,
      },
    });
  }

  async getDevicesByUser(userId: string): Promise<MobileDevice[]> {
    return this.mobileDeviceRepository.find({
      where: { assignedUserId: userId },
      relations: ["assignedUser"],
    });
  }

  async getDevicesByDepartment(department: string): Promise<MobileDevice[]> {
    return this.mobileDeviceRepository.find({
      where: { department },
      relations: ["assignedUser"],
    });
  }

  async getDevicesByStatus(status: MobileDeviceStatus): Promise<MobileDevice[]> {
    return this.mobileDeviceRepository.find({
      where: { status },
      relations: ["assignedUser"],
    });
  }

  async getStatistics() {
    const totalDevices = await this.mobileDeviceRepository.count();
    const availableDevices = await this.mobileDeviceRepository.count({
      where: { status: MobileDeviceStatus.AVAILABLE },
    });
    const assignedDevices = await this.mobileDeviceRepository.count({
      where: { status: MobileDeviceStatus.ASSIGNED },
    });
    const maintenanceDevices = await this.mobileDeviceRepository.count({
      where: { status: MobileDeviceStatus.MAINTENANCE },
    });
    const decommissionedDevices = await this.mobileDeviceRepository.count({
      where: { status: MobileDeviceStatus.DECOMMISSIONED },
    });

    const devicesNeedingOsUpdate = await this.mobileDeviceRepository.count({
      where: { isOsUpdateAvailable: true },
    });

    const devicesWithExpiringWarranty = await this.mobileDeviceRepository.count({
      where: {
        warrantyExpiry: LessThanOrEqual(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      },
    });

    return {
      totalDevices,
      availableDevices,
      assignedDevices,
      maintenanceDevices,
      decommissionedDevices,
      devicesNeedingOsUpdate,
      devicesWithExpiringWarranty,
    };
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.mobileDeviceRepository.remove(device);
  }
} 