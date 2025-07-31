import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceHealthDto } from './create-device-health.dto';

export class UpdateDeviceHealthDto extends PartialType(CreateDeviceHealthDto) {}
