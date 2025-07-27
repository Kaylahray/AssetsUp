import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { WarrantyClaimsService } from './warranty-claims.service';
import { WarrantyClaimsController } from './warranty-claims.controller';
import { WarrantyClaim } from './entities/warranty-claim.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WarrantyClaim]),
    MulterModule.register({
      dest: './uploads/warranty-claims',
    }),
  ],
  controllers: [WarrantyClaimsController],
  providers: [WarrantyClaimsService],
  exports: [WarrantyClaimsService],
})
export class WarrantyClaimsModule {}