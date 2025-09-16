import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AssetLoansService } from "./asset-loans.service"
import { AssetLoansController } from "./asset-loans.controller"
import { LoanRequest } from "./entities/loan-request.entity"

@Module({
  imports: [TypeOrmModule.forFeature([LoanRequest])],
  controllers: [AssetLoansController],
  providers: [AssetLoansService],
})
export class AssetLoansModule {}


