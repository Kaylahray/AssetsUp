import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { ApiKeysModule } from "./api-keys/api-keys.module";
import { OrganizationUnitsModule } from "./organization-units/organization-units.module";
import { ChangeLogModule } from "./change-log/change-log.module";
import { BarcodeModule } from "./barcode/barcode.module";
import { ComplianceModule } from "./compliance/compliance.module";
import { MobileDevicesModule } from "./mobile-devices/mobile-devices.module";
import { PolicyDocumentsModule } from "./policy-documents/policy-documents.module";
import { DeviceHealthModule } from "./device-health/device-health.module";
import { QRCodeModule } from "./QR-Code/qrcode.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { StatusHistoryModule } from "./status-history/status-history.module";
import { DisposalRegistryModule } from "./disposal-registry/disposal-registry.module";
import { VendorDirectoryModule } from "./vendor-directory/vendor-directory.module";
import { WebhooksModule } from "./webhooks/webhooks.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'manage_assets'),
        entities: [
          AssetCategory,
          Department,
          User,
          FileUpload,
          Asset,
          Supplier,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production', // Only for development
      }),
      inject: [ConfigService],
    }),

    AssetCategoriesModule,
    DepartmentsModule,
    AssetTransfersModule,
    UsersModule,
    SearchModule,
    AuthModule,
    ApiKeysModule,
    OrganizationUnitsModule,
    ChangeLogModule,
    BarcodeModule,
    ComplianceModule,
    MobileDevicesModule,
    PolicyDocumentsModule,
    DeviceHealthModule,
    QRCodeModule,
    NotificationsModule,
    StatusHistoryModule,
    DisposalRegistryModule,
    VendorDirectoryModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
