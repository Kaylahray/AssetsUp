import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UsersModule } from "./users/users.module"
import { AuthModule } from "./auth/auth.module"
import { AssetsModule } from "./assets/assets.module"
import { MaintenanceModule } from "./maintenance/maintenance.module"
import { BranchesModule } from "./branches/branches.module"
import { StarknetModule } from "./starknet/starknet.module"
import { InventoryModule } from "./inventory/inventory.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { TasksModule } from "./tasks/tasks.module"
import { AuditModule } from "./audit/audit.module"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "path"
import { ReportsModule } from "./reports/reports.module"
import { HealthModule } from "./health/health.module"
import { ScheduleModule } from "@nestjs/schedule"
import { ThrottlerModule } from "@nestjs/throttler"

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/uploads",
    }),
    UsersModule,
    AuthModule,
    AssetsModule,
    MaintenanceModule,
    BranchesModule,
    StarknetModule,
    InventoryModule,
    NotificationsModule,
    TasksModule,
    AuditModule,
    ReportsModule,
    HealthModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
