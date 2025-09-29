import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetCategoriesModule } from './asset-categories/asset-categories.module';
import { AssetCategory } from './asset-categories/asset-category.entity';
import { DepartmentsModule } from './departments/departments.module';
import { Department } from './departments/department.entity';
import { AssetDisposalsModule } from './asset-disposals/asset-disposals.module';
import { AssetDisposal } from './asset-disposals/entities/asset-disposal.entity';
import { InventoryItem } from './inventory/entities/inventory-item.entity';
import { AssetMaintenanceModule } from './asset-maintenance/asset-maintenance.module';
import { AssetMaintenance } from './asset-maintenance/entities/asset-maintenance.entity';

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
        entities: [AssetCategory, Department, InventoryItem, AssetDisposal, AssetMaintenance],
        synchronize: configService.get('NODE_ENV') !== 'production', // Only for development
      }),
      inject: [ConfigService],
    }),
    AssetCategoriesModule,
    DepartmentsModule,
    AssetDisposalsModule,
    AssetMaintenanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
