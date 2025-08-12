import { Test, TestingModule } from "@nestjs/testing";
import { BranchService } from "./branch.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Branch, BranchStatus } from "./entities/branch.entity";
import { Repository } from "typeorm";

describe("BranchService", () => {
  let service: BranchService;
  let repo: Repository<Branch>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        {
          provide: getRepositoryToken(Branch),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BranchService>(BranchService);
    repo = module.get<Repository<Branch>>(getRepositoryToken(Branch));
  });

  it("should create a branch", async () => {
    const branchData = {
      name: "Main Branch",
      address: "123 Street",
      latitude: 40.7128,
      longitude: -74.006,
      manager: "John Doe",
      status: BranchStatus.ACTIVE,
    };

    jest.spyOn(repo, "create").mockReturnValue(branchData as Branch);
    jest.spyOn(repo, "save").mockResolvedValue(branchData as Branch);

    const result = await service.create(branchData as any);
    expect(result.name).toBe("Main Branch");
    expect(repo.create).toHaveBeenCalledWith(branchData);
  });
});
