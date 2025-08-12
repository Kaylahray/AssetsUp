import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  OnboardingRequest,
  OnboardingRequestStatus,
} from "./onboarding-request.entity";
import { CreateOnboardingRequestDto } from "./dto/create-onboarding-request.dto";
import { NotificationService } from "./notification.service";

@Injectable()
export class OnboardingRequestsService {
  constructor(
    @InjectRepository(OnboardingRequest)
    private repo: Repository<OnboardingRequest>,
    private notificationService: NotificationService
  ) {}

  async create(dto: CreateOnboardingRequestDto) {
    const entity = this.repo.create({
      requesterId: dto.requesterId,
      title: dto.title,
      description: dto.description,
      estimatedValue: dto.estimatedValue,
      proposedCategory: dto.proposedCategory,
      status: OnboardingRequestStatus.Pending,
    });

    const saved = await this.repo.save(entity);

    // Auto-notify approvers (mock)
    await this.notificationService.notifyApprovers(
      saved.id,
      `New onboarding request: ${saved.title}`
    );

    return saved;
  }

  async findOne(id: string) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException("Onboarding request not found");
    return req;
  }

  async findAll(filters?: {
    requesterId?: string;
    status?: OnboardingRequestStatus;
  }) {
    const where: any = {};
    if (filters?.requesterId) where.requesterId = filters.requesterId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: "DESC" } });
  }

  private async ensurePending(id: string) {
    const r = await this.findOne(id);
    if (r.status !== OnboardingRequestStatus.Pending) {
      throw new BadRequestException(`Request is already ${r.status}`);
    }
    return r;
  }

  async approve(id: string, reviewerId: string) {
    const r = await this.ensurePending(id);
    r.status = OnboardingRequestStatus.Approved;
    r.reviewerId = reviewerId;
    r.reviewedAt = new Date();
    const saved = await this.repo.save(r);
    await this.notificationService.notifyApprovers(
      saved.id,
      `Request ${saved.id} approved by ${reviewerId}`
    );
    return saved;
  }

  async reject(id: string, reviewerId: string, comment?: string) {
    const r = await this.ensurePending(id);
    r.status = OnboardingRequestStatus.Rejected;
    r.reviewerId = reviewerId;
    r.reviewedAt = new Date();
    const saved = await this.repo.save(r);
    await this.notificationService.notifyApprovers(
      saved.id,
      `Request ${saved.id} rejected by ${reviewerId}. ${comment ?? ""}`
    );
    return saved;
  }
}
