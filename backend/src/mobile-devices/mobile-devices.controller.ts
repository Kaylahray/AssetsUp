import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { MobileDevicesService } from "./mobile-devices.service";
import { CreateMobileDeviceDto } from "./dto/create-mobile-device.dto";
import { UpdateMobileDeviceDto } from "./dto/update-mobile-device.dto";
import { QueryMobileDeviceDto } from "./dto/query-mobile-device.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("mobile-devices")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MobileDevicesController {
  constructor(private readonly mobileDevicesService: MobileDevicesService) {}

  @Post()
  @Roles("admin", "manager")
  create(@Body() createMobileDeviceDto: CreateMobileDeviceDto) {
    return this.mobileDevicesService.create(createMobileDeviceDto);
  }

  @Get()
  @Roles("admin", "manager", "employee")
  findAll(@Query() queryDto: QueryMobileDeviceDto) {
    return this.mobileDevicesService.findAll(queryDto);
  }

  @Get("statistics")
  @Roles("admin", "manager")
  getStatistics() {
    return this.mobileDevicesService.getStatistics();
  }

  @Get("expiring-warranty")
  @Roles("admin", "manager")
  getDevicesWithExpiringWarranty(@Query("days") days: string = "30") {
    return this.mobileDevicesService.getDevicesWithExpiringWarranty(parseInt(days));
  }

  @Get("expiring-insurance")
  @Roles("admin", "manager")
  getDevicesWithExpiringInsurance(@Query("days") days: string = "30") {
    return this.mobileDevicesService.getDevicesWithExpiringInsurance(parseInt(days));
  }

  @Get("needing-os-update")
  @Roles("admin", "manager")
  getDevicesNeedingOsUpdate() {
    return this.mobileDevicesService.getDevicesNeedingOsUpdate();
  }

  @Get("by-user/:userId")
  @Roles("admin", "manager")
  getDevicesByUser(@Param("userId") userId: string) {
    return this.mobileDevicesService.getDevicesByUser(userId);
  }

  @Get("by-department/:department")
  @Roles("admin", "manager")
  getDevicesByDepartment(@Param("department") department: string) {
    return this.mobileDevicesService.getDevicesByDepartment(department);
  }

  @Get("by-status/:status")
  @Roles("admin", "manager")
  getDevicesByStatus(@Param("status") status: string) {
    return this.mobileDevicesService.getDevicesByStatus(status as any);
  }

  @Get("my-devices")
  @Roles("admin", "manager", "employee")
  getMyDevices(@Request() req) {
    return this.mobileDevicesService.getDevicesByUser(req.user.id);
  }

  @Get(":id")
  @Roles("admin", "manager", "employee")
  findOne(@Param("id") id: string) {
    return this.mobileDevicesService.findOne(id);
  }

  @Get("imei/:imei")
  @Roles("admin", "manager", "employee")
  findByImei(@Param("imei") imei: string) {
    return this.mobileDevicesService.findByImei(imei);
  }

  @Get("serial/:serialNumber")
  @Roles("admin", "manager", "employee")
  findBySerialNumber(@Param("serialNumber") serialNumber: string) {
    return this.mobileDevicesService.findBySerialNumber(serialNumber);
  }

  @Patch(":id")
  @Roles("admin", "manager")
  update(@Param("id") id: string, @Body() updateMobileDeviceDto: UpdateMobileDeviceDto) {
    return this.mobileDevicesService.update(id, updateMobileDeviceDto);
  }

  @Patch(":id/assign")
  @Roles("admin", "manager")
  assignToUser(
    @Param("id") id: string,
    @Body() body: { userId: string; notes?: string }
  ) {
    return this.mobileDevicesService.assignToUser(id, body.userId, body.notes);
  }

  @Patch(":id/unassign")
  @Roles("admin", "manager")
  unassignFromUser(@Param("id") id: string) {
    return this.mobileDevicesService.unassignFromUser(id);
  }

  @Patch(":id/os-update")
  @Roles("admin", "manager")
  updateOsVersion(
    @Param("id") id: string,
    @Body() body: { osVersion: string }
  ) {
    return this.mobileDevicesService.updateOsVersion(id, body.osVersion);
  }

  @Patch(":id/mark-os-update-available")
  @Roles("admin", "manager")
  markOsUpdateAvailable(
    @Param("id") id: string,
    @Body() body: { availableVersion: string }
  ) {
    return this.mobileDevicesService.markOsUpdateAvailable(id, body.availableVersion);
  }

  @Patch(":id/decommission")
  @Roles("admin", "manager")
  decommission(
    @Param("id") id: string,
    @Body() body: { reason: string },
    @Request() req
  ) {
    return this.mobileDevicesService.decommission(id, body.reason, req.user.name);
  }

  @Delete(":id")
  @Roles("admin")
  remove(@Param("id") id: string) {
    return this.mobileDevicesService.remove(id);
  }
} 