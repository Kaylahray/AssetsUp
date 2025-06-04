import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import type { ReportsService } from "./reports.service"

@ApiTags("reports")
@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("asset-distribution")
  @ApiOperation({ summary: "Get asset distribution report" })
  @Roles("admin", "asset_manager")
  async getAssetDistribution() {
    return this.reportsService.getAssetDistributionReport()
  }

  @Get("maintenance")
  @ApiOperation({ summary: "Get maintenance report" })
  @Roles("admin", "asset_manager", "department_head")
  async getMaintenanceReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.reportsService.getMaintenanceReport(start, end)
  }

  @Get("depreciation")
  @ApiOperation({ summary: "Get asset depreciation report" })
  @Roles("admin", "asset_manager")
  async getDepreciationReport() {
    return this.reportsService.getDepreciationReport()
  }

  @Get("checkouts")
  @ApiOperation({ summary: "Get checkout report" })
  @Roles("admin", "asset_manager", "department_head")
  async getCheckoutReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.reportsService.getCheckoutReport(start, end)
  }

  @Get("inventory")
  @ApiOperation({ summary: "Get inventory report" })
  @Roles("admin", "asset_manager", "department_head")
  async getInventoryReport() {
    return this.reportsService.getInventoryReport()
  }

  @Get("transfers")
  @ApiOperation({ summary: "Get asset transfer report" })
  @Roles("admin", "asset_manager")
  async getTransferReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.reportsService.getTransferReport(start, end)
  }

  @Get("audit")
  @ApiOperation({ summary: "Get audit report" })
  @Roles("admin")
  async getAuditReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.reportsService.getAuditReport(start, end)
  }

  @Get("executive-summary")
  @ApiOperation({ summary: "Get executive summary" })
  @Roles("admin")
  async getExecutiveSummary() {
    return this.reportsService.generateExecutiveSummary()
  }

  @Get("asset-distribution-heatmap")
  @ApiOperation({ summary: "Get asset distribution heatmap data" })
  @Roles("admin", "asset_manager")
  async getAssetDistributionHeatmap() {
    return this.reportsService.getAssetDistributionHeatmap()
  }

  @Get("downtime-performance")
  @ApiOperation({ summary: "Get downtime vs performance statistics" })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @Roles("admin", "asset_manager")
  async getDowntimePerformanceStats(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.reportsService.getDowntimePerformanceStats(start, end)
  }

  @Get("expense-maintenance-trends")
  @ApiOperation({ summary: "Get expense vs maintenance trends" })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @Roles("admin", "asset_manager")
  async getExpenseMaintenanceTrends(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.reportsService.getExpenseMaintenanceTrends(start, end)
  }
}
