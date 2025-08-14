import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusHistory } from './entities/status-history.entity';
import { StatusHistoryService } from './status-history.service';
import { StatusHistoryController } from './status-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StatusHistory])],
  controllers: [StatusHistoryController],
  providers: [StatusHistoryService],
  exports: [StatusHistoryService],
})
export class StatusHistoryModule {}
