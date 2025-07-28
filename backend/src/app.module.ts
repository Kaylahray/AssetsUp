import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { OrganizationUnitsModule } from './organization-units/organization-units.module';
import { ChangeLogModule } from './change-log/change-log.module';
import { BarcodeModule } from './barcode/barcode.module';
import { MobileDevicesModule } from './mobile-devices/mobile-devices.module';

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
    UsersModule,
    AuthModule,
    OrganizationUnitsModule,
    ChangeLogModule,
    BarcodeModule,
    MobileDevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}