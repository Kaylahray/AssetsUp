import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApprovalEngineController } from "./approval-engine.controller"
import { ApprovalEngineService } from "./approval-engine.service"
import { ApprovalRequest } from "./entities/approval-request.entity"

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRequest])],
  controllers: [ApprovalEngineController],
  providers: [ApprovalEngineService],
  exports: [ApprovalEngineService],
})
export class ApprovalEngineModule {}
