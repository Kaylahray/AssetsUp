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
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTransfersModule } from './asset-transfers/asset-transfers.module';
import { NotificationsModule } from './notifications/notifications.module';

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
    NotificationsModule,
  ],
  controllers: [AppController, NotificationsController],
  providers: [AppService, NotificationsService],
})
export class AppModule {}
