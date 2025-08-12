import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OnboardingRequest } from "./onboarding-request.entity";
import { OnboardingRequestsService } from "./onboarding-requests.service";
import { OnboardingRequestsController } from "./onboarding-requests.controller";
import { NotificationService } from "./notification.service";

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingRequest])],
  providers: [OnboardingRequestsService, NotificationService],
  controllers: [OnboardingRequestsController],
  exports: [OnboardingRequestsService],
})
export class OnboardingRequestsModule {}
