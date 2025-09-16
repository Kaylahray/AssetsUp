import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { AssetLoansService } from "../asset-loans.service"
import { LoanApprovalStatus, LoanRequest } from "../entities/loan-request.entity"

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

function createMockRepo(): MockRepo {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  }
}

describe("AssetLoansService", () => {
  let service: AssetLoansService
  let repo: MockRepo<LoanRequest>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AssetLoansService,
        { provide: getRepositoryToken(LoanRequest), useValue: createMockRepo() },
      ],
    }).compile()

    service = module.get(AssetLoansService)
    repo = module.get(getRepositoryToken(LoanRequest))
  })

  it("creates a loan request", async () => {
    const dto = { borrowerId: "00000000-0000-0000-0000-000000000001", assetType: "Laptop" }
    const created: Partial<LoanRequest> = { id: "1", ...dto, approvalStatus: LoanApprovalStatus.PENDING }
    repo.create!.mockReturnValue(created)
    repo.save!.mockResolvedValue(created)

    const result = await service.create(dto as any)
    expect(repo.create).toHaveBeenCalled()
    expect(repo.save).toHaveBeenCalled()
    expect(result).toMatchObject({ assetType: "Laptop", approvalStatus: LoanApprovalStatus.PENDING })
  })

  it("flags overdue loans in cron", async () => {
    const overdue: Partial<LoanRequest> = {
      id: "1",
      approvalStatus: LoanApprovalStatus.APPROVED,
      returnDueDate: new Date(Date.now() - 86400000),
    }
    repo.find!.mockResolvedValue([overdue])

    const count = await service.flagOverdueLoans()
    expect(count).toBe(1)
  })
})


