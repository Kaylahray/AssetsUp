import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetCategoriesModule } from './asset-categories/asset-categories.module';
import { AssetCategory } from './asset-categories/asset-category.entity';
import { DepartmentsModule } from './departments/departments.module';
import { Department } from './departments/department.entity';
import { CompaniesModule } from './companies/companies.module';
import { Company } from './companies/entities/company.entity';
import { BranchesModule } from './branches/branches.module';
import { Branch } from './branches/entities/branch.entity';
import { AssetTransfersModule } from './asset-transfers/asset-transfers.module';
import { AssetTransfer } from './asset-transfers/entities/asset-transfer.entity';
import { InventoryItem as InventoryItemTop } from '../inventory-items/entities/inventory-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,
         // --- ADD THIS CONFIGURATION ---
      I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'), // Directory for translation files
        watch: true, // Watch for changes in translation files
      },
      resolvers: [
        // Order matters: checks query param, then header, then browser settings
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['x-custom-lang-header']),
        AcceptLanguageResolver, // Standard 'Accept-Language' header
      ],
    }),
    // --- END OF CONFIGURATION ---
  ],],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'manage_assets'),
        entities: [AssetCategory, Department, Company, Branch, AssetTransfer, InventoryItemTop],
        synchronize: configService.get('NODE_ENV') !== 'production', // Only for development
      }),
      inject: [ConfigService],
    }),
    AssetCategoriesModule,
    DepartmentsModule,
    CompaniesModule,
    BranchesModule,
    AssetTransfersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
