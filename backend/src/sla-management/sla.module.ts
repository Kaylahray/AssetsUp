import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SLAService } from './sla.service';
import { SLAController } from './sla.controller';
import { SLARecord } from './entities/sla-record.entity';
import { SLABreach } from './entities/sla-breach.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SLARecord, SLABreach])],
  controllers: [SLAController],
  providers: [SLAService],
  exports: [SLAService],
})
export class SLAModule {}
