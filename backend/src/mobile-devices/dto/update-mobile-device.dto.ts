import { PartialType } from "@nestjs/mapped-types";
import { CreateMobileDeviceDto } from "./create-mobile-device.dto";

export class UpdateMobileDeviceDto extends PartialType(CreateMobileDeviceDto) {} 