import { Injectable, Logger } from "@nestjs/common"
import type { StarknetService } from "../starknet.service"
import type { TransactionMonitorService } from "./transaction-monitor.service"

export interface BatchOperation {
  id: string
  type: "transfer" | "checkout" | "maintenance" | "assignment"
  items: any[]
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  totalItems: number
  completedItems: number
  failedItems: number
  transactionHashes: string[]
  startedAt: Date
  completedAt?: Date
  error?: string
}

@Injectable()
export class BatchOperationsService {
  private readonly logger = new Logger(BatchOperationsService.name)
  private activeBatches = new Map<string, BatchOperation>()

  constructor(
    private starknetService: StarknetService,
    private transactionMonitorService: TransactionMonitorService,
  ) {}

  async createBatchTransfer(assetIds: string[], newOwnerId: string, userId: string): Promise<string> {
    const batchId = this.generateBatchId()
    const batch: BatchOperation = {
      id: batchId,
      type: "transfer",
      items: assetIds.map((id) => ({ assetId: id, newOwnerId })),
      status: "pending",
      progress: 0,
      totalItems: assetIds.length,
      completedItems: 0,
      failedItems: 0,
      transactionHashes: [],
      startedAt: new Date(),
    }

    this.activeBatches.set(batchId, batch)

    // Start processing the batch
    this.processBatchTransfer(batchId, userId)

    return batchId
  }

  async createBatchCheckout(
    items: Array<{ assetId: string; userId: string; dueDate: Date; purpose: string }>,
    performedBy: string,
  ): Promise<string> {
    const batchId = this.generateBatchId()
    const batch: BatchOperation = {
      id: batchId,
      type: "checkout",
      items,
      status: "pending",
      progress: 0,
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      transactionHashes: [],
      startedAt: new Date(),
    }

    this.activeBatches.set(batchId, batch)

    // Start processing the batch
    this.processBatchCheckout(batchId, performedBy)

    return batchId
  }

  async createBatchMaintenance(
    items: Array<{ assetId: string; maintenanceId: string }>,
    performedBy: string,
  ): Promise<string> {
    const batchId = this.generateBatchId()
    const batch: BatchOperation = {
      id: batchId,
      type: "maintenance",
      items,
      status: "pending",
      progress: 0,
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      transactionHashes: [],
      startedAt: new Date(),
    }

    this.activeBatches.set(batchId, batch)

    // Start processing the batch
    this.processBatchMaintenance(batchId, performedBy)

    return batchId
  }

  async getBatchStatus(batchId: string): Promise<BatchOperation | null> {
    return this.activeBatches.get(batchId) || null
  }

  async getAllActiveBatches(): Promise<BatchOperation[]> {
    return Array.from(this.activeBatches.values())
  }

  async cancelBatch(batchId: string): Promise<boolean> {
    const batch = this.activeBatches.get(batchId)
    if (!batch || batch.status === "completed") {
      return false
    }

    batch.status = "failed"
    batch.error = "Cancelled by user"
    batch.completedAt = new Date()

    return true
  }

  private async processBatchTransfer(batchId: string, userId: string): Promise<void> {
    const batch = this.activeBatches.get(batchId)
    if (!batch) return

    try {
      batch.status = "processing"

      // Process items in chunks to avoid overwhelming the network
      const chunkSize = 10
      const chunks = this.chunkArray(batch.items, chunkSize)

      for (const chunk of chunks) {
        const assetIds = chunk.map((item) => item.assetId)
        const newOwnerId = chunk[0].newOwnerId

        try {
          const transactionHash = await this.starknetService.batchTransferAssets(assetIds, newOwnerId)

          if (transactionHash) {
            batch.transactionHashes.push(transactionHash)

            // Track the transaction
            await this.transactionMonitorService.trackTransaction(
              transactionHash,
              "batch_transfer",
              batchId,
              "batch_operation",
              userId,
            )

            batch.completedItems += chunk.length
          } else {
            batch.failedItems += chunk.length
          }
        } catch (error) {
          this.logger.error(`Failed to process batch transfer chunk: ${error.message}`)
          batch.failedItems += chunk.length
        }

        batch.progress = ((batch.completedItems + batch.failedItems) / batch.totalItems) * 100

        // Add delay between chunks to avoid rate limiting
        await this.delay(1000)
      }

      batch.status = batch.failedItems === 0 ? "completed" : "failed"
      batch.completedAt = new Date()

      if (batch.failedItems > 0) {
        batch.error = `${batch.failedItems} items failed to process`
      }
    } catch (error) {
      batch.status = "failed"
      batch.error = error.message
      batch.completedAt = new Date()
      this.logger.error(`Batch transfer ${batchId} failed: ${error.message}`)
    }
  }

  private async processBatchCheckout(batchId: string, performedBy: string): Promise<void> {
    const batch = this.activeBatches.get(batchId)
    if (!batch) return

    try {
      batch.status = "processing"

      for (const item of batch.items) {
        try {
          const transactionHash = await this.starknetService.checkoutAsset(
            item.assetId,
            item.userId,
            item.dueDate,
            item.purpose,
          )

          if (transactionHash) {
            batch.transactionHashes.push(transactionHash)

            // Track the transaction
            await this.transactionMonitorService.trackTransaction(
              transactionHash,
              "checkout",
              item.assetId,
              "asset",
              performedBy,
            )

            batch.completedItems++
          } else {
            batch.failedItems++
          }
        } catch (error) {
          this.logger.error(`Failed to checkout asset ${item.assetId}: ${error.message}`)
          batch.failedItems++
        }

        batch.progress = ((batch.completedItems + batch.failedItems) / batch.totalItems) * 100

        // Add delay between operations
        await this.delay(500)
      }

      batch.status = batch.failedItems === 0 ? "completed" : "failed"
      batch.completedAt = new Date()

      if (batch.failedItems > 0) {
        batch.error = `${batch.failedItems} items failed to process`
      }
    } catch (error) {
      batch.status = "failed"
      batch.error = error.message
      batch.completedAt = new Date()
      this.logger.error(`Batch checkout ${batchId} failed: ${error.message}`)
    }
  }

  private async processBatchMaintenance(batchId: string, performedBy: string): Promise<void> {
    const batch = this.activeBatches.get(batchId)
    if (!batch) return

    try {
      batch.status = "processing"

      for (const item of batch.items) {
        try {
          const transactionHash = await this.starknetService.recordMaintenanceLog(item.assetId, item.maintenanceId)

          if (transactionHash) {
            batch.transactionHashes.push(transactionHash)

            // Track the transaction
            await this.transactionMonitorService.trackTransaction(
              transactionHash,
              "maintenance",
              item.assetId,
              "asset",
              performedBy,
            )

            batch.completedItems++
          } else {
            batch.failedItems++
          }
        } catch (error) {
          this.logger.error(`Failed to record maintenance for asset ${item.assetId}: ${error.message}`)
          batch.failedItems++
        }

        batch.progress = ((batch.completedItems + batch.failedItems) / batch.totalItems) * 100

        // Add delay between operations
        await this.delay(500)
      }

      batch.status = batch.failedItems === 0 ? "completed" : "failed"
      batch.completedAt = new Date()

      if (batch.failedItems > 0) {
        batch.error = `${batch.failedItems} items failed to process`
      }
    } catch (error) {
      batch.status = "failed"
      batch.error = error.message
      batch.completedAt = new Date()
      this.logger.error(`Batch maintenance ${batchId} failed: ${error.message}`)
    }
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
