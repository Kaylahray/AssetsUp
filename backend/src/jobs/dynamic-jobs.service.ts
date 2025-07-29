import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';

@Injectable()
export class DynamicJobsService {
  private readonly logger = new Logger(DynamicJobsService.name);
  private jobs = new Map<string, CronJob>();

  registerJob({ name, cronTime, handler }: JobDefinition) {
    if (this.jobs.has(name)) {
      this.logger.warn(`Job "${name}" already exists.`);
      return;
    }
    const job = new CronJob(cronTime, async () => {
      try {
        this.logger.log(`Running job "${name}"`);
        await handler();
        this.logger.log(`Job "${name}" executed successfully.`);
      } catch (err) {
        this.logger.error(`Job "${name}" failed`, err.stack);
      }
    });

    job.start();
    this.jobs.set(name, job);
    this.logger.log(`Registered and started job "${name}"`);
  }

  disableJob(name: string) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.logger.log(`Disabled job "${name}"`);
    }
  }

  enableJob(name: string) {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      this.logger.log(`Enabled job "${name}"`);
    }
  }

  listJobs() {
    return Array.from(this.jobs.keys());
  }
}
