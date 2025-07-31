import { Module } from '@nestjs/common';
import { PermissionsService } from './permission.service';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permission.controller';

@Module({
    providers: [PermissionsService, RolesService],
    controllers: [PermissionsController, RolesController]
})
export class PermissionModule {}
