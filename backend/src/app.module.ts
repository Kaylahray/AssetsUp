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
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get("NODE_ENV") !== "production",
      }),
    }),
    ScheduleModule.forRoot(),
    UsersModule,
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