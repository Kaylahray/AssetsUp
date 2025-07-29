import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ComplianceService } from "./compliance.service";

@Injectable()
export class ComplianceScheduler {
  constructor(private service: ComplianceService) {}

  @Cron("0 0 * * *")
  handleCron() {
    this.service
      .markOverdueItems()
      .then((count) => console.log(`Marked ${count} items as OVERDUE`));
  }
}
