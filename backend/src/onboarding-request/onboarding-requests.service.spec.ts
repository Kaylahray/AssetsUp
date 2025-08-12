import { Test, TestingModule } from "@nestjs/testing";
import { OnboardingRequestsService } from "./onboarding-requests.service";
import { NotificationService } from "./notification.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  OnboardingRequest,
  OnboardingRequestStatus,
} from "./onboarding-request.entity";
import { Repository } from "typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo<T = any>(): MockRepo<T> {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
}

describe("OnboardingRequestsService", () => {
  let service: OnboardingRequestsService;
  let repo: MockRepo<OnboardingRequest>;
  let notification: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingRequestsService,
        {
          provide: getRepositoryToken(OnboardingRequest),
          useValue: createMockRepo(),
        },
        {
          provide: NotificationService,
          useValue: { notifyApprovers: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<OnboardingRequestsService>(OnboardingRequestsService);
    repo = module.get(getRepositoryToken(OnboardingRequest));
    notification = module.get(NotificationService);
  });

  it("creates a request and notifies", async () => {
    const dto = {
      requesterId: "11111111-1111-1111-1111-111111111111",
      title: "New Tractor",
      description: "Powerful tractor",
      estimatedValue: 20000,
      proposedCategory: "Vehicle",
    };

    const createdEntity = {
      ...dto,
      id: "aaa",
      status: OnboardingRequestStatus.Pending,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repo.create!.mockReturnValue(createdEntity);
    repo.save!.mockResolvedValue(createdEntity);

    const res = await service.create(dto as any);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(createdEntity);
    expect(notification.notifyApprovers).toHaveBeenCalledWith(
      createdEntity.id,
      expect.any(String)
    );
    expect(res).toBe(createdEntity);
  });

  it("approves a pending request", async () => {
    const id = "req-1";
    const reviewerId = "rev-1";
    const existing = {
      id,
      status: OnboardingRequestStatus.Pending,
      save: undefined,
    };
    // repo.findOne should return object
    repo.findOne!.mockResolvedValue(existing);
    const saved = {
      ...existing,
      status: OnboardingRequestStatus.Approved,
      reviewerId,
      reviewedAt: new Date(),
    };
    repo.save!.mockResolvedValue(saved);

    const res = await service.approve(id, reviewerId);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(notification.notifyApprovers).toHaveBeenCalledWith(
      id,
      expect.any(String)
    );
    expect(res.status).toBe(OnboardingRequestStatus.Approved);
    expect(res.reviewerId).toBe(reviewerId);
  });

  it("rejects a pending request", async () => {
    const id = "req-2";
    const reviewerId = "rev-2";
    repo.findOne!.mockResolvedValue({
      id,
      status: OnboardingRequestStatus.Pending,
    });
    repo.save!.mockImplementation(async (r) => r);

    const res = await service.reject(id, reviewerId, "not fit");

    expect(res.status).toBe(OnboardingRequestStatus.Rejected);
    expect(res.reviewerId).toBe(reviewerId);
    expect(notification.notifyApprovers).toHaveBeenCalled();
  });

  it("throws if approving non-existing request", async () => {
    repo.findOne!.mockResolvedValue(null);
    await expect(service.approve("no", "rev")).rejects.toThrow(
      NotFoundException
    );
  });

  it("throws if approving already approved", async () => {
    const id = "req-3";
    repo.findOne!.mockResolvedValue({
      id,
      status: OnboardingRequestStatus.Approved,
    });
    await expect(service.approve(id, "rev")).rejects.toThrow(
      BadRequestException
    );
  });

  it("findAll with filters calls repo.find", async () => {
    (repo.find as jest.Mock).mockResolvedValue([]);
    const res = await service.findAll({
      requesterId: "r1",
      status: OnboardingRequestStatus.Pending,
    });
    expect(repo.find).toHaveBeenCalledWith({
      where: { requesterId: "r1", status: OnboardingRequestStatus.Pending },
      order: { createdAt: "DESC" },
    });
    expect(res).toEqual([]);
  });
});
