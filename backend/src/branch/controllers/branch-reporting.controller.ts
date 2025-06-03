import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger"
import type { BranchReportingService } from "../services/branch-reporting.service"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { BranchGuard } from "../guards/branch.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"

@ApiTags("branch-reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("branches")
export class BranchReportingController {
  constructor(private readonly branchReportingService: BranchReportingService) {}

  @Get(':id/reports/inventory')
  @UseGuards(BranchGuard)
  @ApiOperation({ summary: 'Get inventory report for a branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Inventory report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  getInventoryReport(@Param('id') branchId: string) {
    return this.branchReportingService.getInventoryReport(branchId);
  }

  @Get(':id/reports/assets')
  @UseGuards(BranchGuard)
  @ApiOperation({ summary: 'Get asset report for a branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Asset report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  getAssetReport(@Param('id') branchId: string) {
    return this.branchReportingService.getAssetReport(branchId);
  }

  @Get(":id/reports/transactions")
  @UseGuards(BranchGuard)
  @ApiOperation({ summary: "Get transaction report for a branch" })
  @ApiParam({ name: "id", description: "Branch UUID" })
  @ApiQuery({ name: "startDate", required: false, type: Date, description: "Start date for report (ISO string)" })
  @ApiQuery({ name: "endDate", required: false, type: Date, description: "End date for report (ISO string)" })
  @ApiResponse({ status: 200, description: "Transaction report retrieved successfully" })
  @ApiResponse({ status: 404, description: "Branch not found" })
  getTransactionReport(
    @Param('id') branchId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    return this.branchReportingService.getTransactionReport(branchId, start, end)
  }

  @Get("reports/all")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Get comprehensive report for all branches" })
  @ApiResponse({ status: 200, description: "All branches report retrieved successfully" })
  getAllBranchesReport() {
    return this.branchReportingService.getAllBranchesReport()
  }

  @Get("reports/performance-comparison")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Get branch performance comparison report" })
  @ApiResponse({ status: 200, description: "Branch performance comparison retrieved successfully" })
  getBranchPerformanceComparison() {
    return this.branchReportingService.getBranchPerformanceComparison()
  }
}
