import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { AssetLoansService } from "./asset-loans.service"
import { CreateLoanRequestDto } from "./dto/create-loan-request.dto"
import { UpdateLoanStatusDto } from "./dto/update-loan-status.dto"
import { LoanApprovalStatus } from "./entities/loan-request.entity"

@ApiTags("asset-loans")
@Controller("asset-loans")
export class AssetLoansController {
  constructor(private readonly service: AssetLoansService) {}

  @Post()
  create(@Body() dto: CreateLoanRequestDto) {
    return this.service.create(dto)
  }

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id)
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateLoanStatusDto) {
    return this.service.updateStatus(id, dto.status as LoanApprovalStatus)
  }

  @Post(":id/return")
  markReturned(@Param("id") id: string) {
    return this.service.markReturned(id)
  }
}


