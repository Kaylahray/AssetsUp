
import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { DynamicJobsService } from './dynamic-jobs.service';
import { JobDefinition } from './interfaces/job-definition.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: DynamicJobsService) {}

  @Post('register')
  register(@Body() job: JobDefinition) {
    this.jobsService.registerJob(job);
    return { message: `Job "${job.name}" registered.` };
  }

  @Post('disable/:name')
  disable(@Param('name') name: string) {
    this.jobsService.disableJob(name);
    return { message: `Job "${name}" disabled.` };
  }

  @Post('enable/:name')
  enable(@Param('name') name: string) {
    this.jobsService.enableJob(name);
    return { message: `Job "${name}" enabled.` };
  }

  @Get()
  list() {
    return this.jobsService.listJobs();
  }
}
