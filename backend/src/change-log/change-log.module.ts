import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeLog } from './entities/change-log.entity';
import { ChangeLogService } from './change-log.service';
import { ChangeLogController } from './change-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChangeLog])],
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
  exports: [ChangeLogService], 
})
export class ChangeLogModule {}