import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetCategoriesModule } from './asset-categories/asset-categories.module';
import { SettingsModule } from './settings/settings.module';
import { AssetCategory } from './asset-categories/asset-category.entity';
import { DepartmentsModule } from './departments/departments.module';
import { Department } from './departments/department.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

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
        entities: [AssetCategory, Department, User],
        synchronize: configService.get('NODE_ENV') !== 'production', // Only for development
      }),
      inject: [ConfigService],
    }),

    AssetCategoriesModule,
    DepartmentsModule,
    AssetTransfersModule,
    UsersModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
