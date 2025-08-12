import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { OnboardingRequestsService } from "./onboarding-requests.service";
import { CreateOnboardingRequestDto } from "./dto/create-onboarding-request.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { OnboardingRequestStatus } from "./onboarding-request.entity";

@Controller("onboarding-requests")
export class OnboardingRequestsController {
  constructor(private svc: OnboardingRequestsService) {}

  @Post()
  async submit(@Body() dto: CreateOnboardingRequestDto) {
    return this.svc.create(dto);
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.svc.findOne(id);
  }

  @Get()
  async list(
    @Query("requesterId") requesterId?: string,
    @Query("status") status?: OnboardingRequestStatus
  ) {
    return this.svc.findAll({ requesterId, status });
  }

  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  async approve(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.svc.approve(id, dto.reviewerId);
  }

  @Post(":id/reject")
  @HttpCode(HttpStatus.OK)
  async reject(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.svc.reject(id, dto.reviewerId, dto.comment);
  }
}
