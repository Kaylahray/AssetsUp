import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { GetUser } from "../../auth/decorators/get-user.decorator"
import type { User } from "../../users/entities/user.entity"
import type { StarknetService } from "../starknet.service"
import type { TransactionMonitorService } from "../services/transaction-monitor.service"
import type { BatchOperationsService } from "../services/batch-operations.service"
import type { ContractDeploymentService } from "../services/contract-deployment.service"

@ApiTags("starknet")
@Controller("starknet")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StarknetController {
  constructor(
    private readonly starknetService: StarknetService,
    private readonly transactionMonitorService: TransactionMonitorService,
    private readonly batchOperationsService: BatchOperationsService,
    private readonly contractDeploymentService: ContractDeploymentService,
  ) {}

  @Get("status")
  @ApiOperation({ summary: "Get StarkNet integration status" })
  @Roles("admin", "asset_manager")
  async getStatus() {
    const stats = await this.transactionMonitorService.getTransactionStatistics()
    return {
      connected: true,
      transactionStats: stats,
      timestamp: new Date(),
    }
  }

  @Get("transactions")
  @ApiOperation({ summary: "Get user transactions" })
  async getUserTransactions() {
    return this.transactionMonitorService.getTransactionsByUser("userId")
  }

  @Get("transactions/:hash")
  @ApiOperation({ summary: "Get transaction status" })
  async getTransactionStatus(@Param("hash") hash: string) {
    return this.transactionMonitorService.getTransactionStatus(hash)
  }

  @Get("assets/:id/transactions")
  @ApiOperation({ summary: "Get asset transactions" })
  async getAssetTransactions(@Param("id") assetId: string) {
    return this.transactionMonitorService.getTransactionsByEntity(assetId, "asset")
  }

  @Get("assets/:id/audit-trail")
  @ApiOperation({ summary: "Get asset audit trail from blockchain" })
  async getAssetAuditTrail(@Param("id") assetId: string) {
    return this.starknetService.getAssetAuditTrail(assetId)
  }

  @Get("assets/:id/details")
  @ApiOperation({ summary: "Get asset details from blockchain" })
  async getAssetDetails(@Param("id") assetId: string) {
    return this.starknetService.getAssetDetails(assetId)
  }

  @Get("assets/:id/transfer-history")
  @ApiOperation({ summary: "Get asset transfer history from blockchain" })
  async getAssetTransferHistory(@Param("id") assetId: string) {
    return this.starknetService.getAssetTransferHistory(assetId)
  }

  @Post("batch/transfer")
  @ApiOperation({ summary: "Create batch transfer operation" })
  @Roles("admin", "asset_manager")
  async createBatchTransfer(@Body() body: { assetIds: string[]; newOwnerId: string }, @GetUser() user: User) {
    const batchId = await this.batchOperationsService.createBatchTransfer(body.assetIds, body.newOwnerId, user.id)
    return { batchId }
  }

  @Post("batch/checkout")
  @ApiOperation({ summary: "Create batch checkout operation" })
  @Roles("admin", "asset_manager", "department_head")
  async createBatchCheckout(
    @Body()
    body: {
      items: Array<{ assetId: string; userId: string; dueDate: string; purpose: string }>
    },
    @GetUser() user: User,
  ) {
    const items = body.items.map((item) => ({
      ...item,
      dueDate: new Date(item.dueDate),
    }))
    const batchId = await this.batchOperationsService.createBatchCheckout(items, user.id)
    return { batchId }
  }

  @Post("batch/maintenance")
  @ApiOperation({ summary: "Create batch maintenance operation" })
  @Roles("admin", "asset_manager")
  async createBatchMaintenance(
    @Body() body: { items: Array<{ assetId: string; maintenanceId: string }> },
    @GetUser() user: User,
  ) {
    const batchId = await this.batchOperationsService.createBatchMaintenance(body.items, user.id)
    return { batchId }
  }

  @Get("batch/:id")
  @ApiOperation({ summary: "Get batch operation status" })
  async getBatchStatus(@Param("id") batchId: string) {
    return this.batchOperationsService.getBatchStatus(batchId)
  }

  @Get("batch")
  @ApiOperation({ summary: "Get all active batch operations" })
  @Roles("admin", "asset_manager")
  async getAllBatches() {
    return this.batchOperationsService.getAllActiveBatches()
  }

  @Post("batch/:id/cancel")
  @ApiOperation({ summary: "Cancel batch operation" })
  @Roles("admin", "asset_manager")
  async cancelBatch(@Param("id") batchId: string) {
    const cancelled = await this.batchOperationsService.cancelBatch(batchId)
    return { cancelled }
  }

  @Post("contracts/deploy")
  @ApiOperation({ summary: "Deploy contracts to StarkNet" })
  @Roles("admin")
  async deployContracts() {
    return this.contractDeploymentService.deployAllContracts()
  }

  @Post("contracts/:name/deploy")
  @ApiOperation({ summary: "Deploy specific contract" })
  @Roles("admin")
  async deployContract(@Param("name") contractName: string, @Body() body: { constructorCalldata?: any[] }) {
    return this.contractDeploymentService.deployContract({
      contractName,
      constructorCalldata: body.constructorCalldata,
    })
  }

  @Post("contracts/:address/verify")
  @ApiOperation({ summary: "Verify deployed contract" })
  @Roles("admin")
  async verifyContract(@Param("address") contractAddress: string, @Query("name") contractName: string) {
    const verified = await this.contractDeploymentService.verifyContract(contractAddress, contractName)
    return { verified }
  }

  @Post("audit/verify-chain")
  @ApiOperation({ summary: "Verify audit chain integrity" })
  @Roles("admin", "asset_manager")
  async verifyAuditChain(@Body() body: { startIndex?: number; endIndex?: number }) {
    const verified = await this.starknetService.verifyAuditChain(body.startIndex || 0, body.endIndex || 100)
    return { verified }
  }

  @Get("certificates/:id/verify")
  @ApiOperation({ summary: "Verify certificate on blockchain" })
  async verifyCertificate(@Param("id") certificateId: string) {
    const verified = await this.starknetService.verifyCertificate(certificateId)
    return { verified }
  }
}
