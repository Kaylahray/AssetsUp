import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { DynamicJobsService } from './dynamic-jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  providers: [JobService, DynamicJobsService],
  controllers: [JobsController],
})
export class JobsModule {}
