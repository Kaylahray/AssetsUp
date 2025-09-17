import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, LessThan, IsNull, Not } from "typeorm"
import dayjs from "dayjs"
import { LoanRequest, LoanApprovalStatus } from "./entities/loan-request.entity"
import { CreateLoanRequestDto } from "./dto/create-loan-request.dto"

@Injectable()
export class AssetLoansService {
  private readonly logger = new Logger(AssetLoansService.name)

  constructor(
    @InjectRepository(LoanRequest)
    private readonly loanRepo: Repository<LoanRequest>,
  ) {}

  async create(dto: CreateLoanRequestDto): Promise<LoanRequest> {
    const entity = this.loanRepo.create({
      borrowerId: dto.borrowerId,
      assetType: dto.assetType,
      returnDueDate: dto.returnDueDate ? new Date(dto.returnDueDate) : null,
    })
    return this.loanRepo.save(entity)
  }

  async findAll(): Promise<LoanRequest[]> {
    return this.loanRepo.find({ order: { requestDate: "DESC" } })
  }

  async findOne(id: string): Promise<LoanRequest> {
    const found = await this.loanRepo.findOne({ where: { id } })
    if (!found) throw new NotFoundException("Loan request not found")
    return found
  }

  async updateStatus(id: string, status: LoanApprovalStatus): Promise<LoanRequest> {
    const loan = await this.findOne(id)
    loan.approvalStatus = status
    return this.loanRepo.save(loan)
  }

  async markReturned(id: string): Promise<LoanRequest> {
    const loan = await this.findOne(id)
    loan.approvalStatus = LoanApprovalStatus.RETURNED
    loan.returnedAt = new Date()
    return this.loanRepo.save(loan)
  }

  // Basic enforcement: if overdue and still APPROVED, log and could auto-flag
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async flagOverdueLoans(): Promise<number> {
    const now = new Date()
    const overdue = await this.loanRepo.find({
      where: {
        approvalStatus: LoanApprovalStatus.APPROVED,
        returnDueDate: LessThan(now),
        returnedAt: IsNull(),
      },
    })

    if (overdue.length > 0) {
      this.logger.warn(`Found ${overdue.length} overdue loan(s) as of ${dayjs(now).toISOString()}`)
    }
    // Placeholder for escalation logic; keeping module independent
    return overdue.length
  }
}


