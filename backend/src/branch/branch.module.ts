import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

// Entities
import { Branch } from "./entities/branch.entity"
import { Asset } from "../assets/entities/asset.entity"
import { Inventory } from "../inventory/entities/inventory.entity"
import { Transaction } from "../transactions/entities/transaction.entity"
import { User } from "../users/entities/user.entity"

// Controllers
import { BranchController } from "./controllers/branch.controller"
import { BranchReportingController } from "./controllers/branch-reporting.controller"

// Services
import { BranchService } from "./services/branch.service"
import { BranchReportingService } from "./services/branch-reporting.service"
import { BranchValidationService } from "./services/branch-validation.service"

// Guards
import { BranchGuard } from "./guards/branch.guard"
import { BranchOwnershipGuard } from "./guards/branch-ownership.guard"

// Providers
import { BranchRepository } from "./repositories/branch.repository"

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Asset, Inventory, Transaction, User])],
  controllers: [BranchController, BranchReportingController],
  providers: [
    BranchService,
    BranchReportingService,
    BranchValidationService,
    BranchGuard,
    BranchOwnershipGuard,
    BranchRepository,
  ],
  exports: [BranchService, BranchReportingService, BranchValidationService, BranchRepository],
})
export class BranchModule {}
