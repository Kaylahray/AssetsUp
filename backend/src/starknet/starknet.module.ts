import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { StarknetService } from "./starknet.service"
import { StarknetController } from "./controllers/starknet.controller"
import { ContractDeploymentService } from "./services/contract-deployment.service"
import { TransactionMonitorService } from "./services/transaction-monitor.service"
import { EventListenerService } from "./services/event-listener.service"
import { BatchOperationsService } from "./services/batch-operations.service"
import { StarknetTransaction } from "./entities/starknet-transaction.entity"
import { NotificationsModule } from "../notifications/notifications.module"
import { AuditModule } from "../audit/audit.module"

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([StarknetTransaction]), NotificationsModule, AuditModule],
  providers: [
    StarknetService,
    ContractDeploymentService,
    TransactionMonitorService,
    EventListenerService,
    BatchOperationsService,
  ],
  controllers: [StarknetController],
  exports: [StarknetService, TransactionMonitorService, BatchOperationsService, ContractDeploymentService],
})
export class StarknetModule {}
