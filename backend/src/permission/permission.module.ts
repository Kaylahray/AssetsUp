import { Module } from '@nestjs/common';
import { PermissionsService } from './permission.service';
import { RolesService } from './roles.service';
import { PermissionController } from './permission.controller';
import { RolesController } from './roles.controller';

@Module({
    providers: [PermissionsService, RolesService],
    controllers: [PermissionController, RolesController]
})
export class PermissionModule {}
