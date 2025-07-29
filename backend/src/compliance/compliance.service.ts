import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ComplianceItem } from "./compliance.entity";
import { Repository } from "typeorm";
import { CreateComplianceDto } from "./dto/create-compliance.dto";
@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceItem)
    private repo: Repository<ComplianceItem>
  ) {}

  create(data: CreateComplianceDto) {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  findAll() {
    return this.repo.find();
  }

  update(id: number, data: UpdateComplianceDto) {
    return this.repo.update(id, data);
  }

  async markOverdueItems() {
    const now = new Date();
    const items = await this.repo.find({
      where: { status: "PENDING" },
    });

    const overdue = items.filter((item) => new Date(item.deadline) < now);
    for (const item of overdue) {
      item.status = "OVERDUE";
      await this.repo.save(item);
    }

    return overdue.length;
  }
}
