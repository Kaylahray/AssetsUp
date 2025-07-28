import { Module } from '@nestjs/common';
import { DepreciationController } from './controllers/depreciation.controller';
import { DepreciationService } from './services/depreciation.service';

@Module({
  controllers: [DepreciationController],
  providers: [DepreciationService],
  exports: [DepreciationService], // Export for potential use in other modules
})
export class DepreciationModule {}