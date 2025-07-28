import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    this.logger.log(`Executed cron job at ${new Date().toISOString()}`);
  }
}
