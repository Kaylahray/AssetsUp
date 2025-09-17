import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { InsurancePolicy } from './entities/insurance-policy.entity';
import { PolicyDocument } from './entities/policy-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InsurancePolicy, PolicyDocument]),
    MulterModule.register({
      dest: './uploads/insurance',
    }),
  ],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
