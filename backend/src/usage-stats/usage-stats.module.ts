import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageStat } from './usage-stats.entity';
import { UsageStatsService } from './usage-stats.service';
import { UsageStatsController } from './usage-stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsageStat])],
  controllers: [UsageStatsController],
  providers: [UsageStatsService],
})
export class UsageStatsModule {}
