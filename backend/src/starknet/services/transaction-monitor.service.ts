import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import type { ConfigService } from "@nestjs/config"
import { type Provider, RpcProvider } from "starknet"
import { StarknetTransaction } from "../entities/starknet-transaction.entity"

export enum TransactionStatus {
  PENDING = "pending",
  ACCEPTED_ON_L2 = "accepted_on_l2",
  ACCEPTED_ON_L1 = "accepted_on_l1",
  REJECTED = "rejected",
  FAILED = "failed",
}

@Injectable()
export class TransactionMonitorService {
  private readonly logger = new Logger(TransactionMonitorService.name)
  private provider: Provider;

  constructor(
    @InjectRepository(StarknetTransaction)
    private readonly transactionRepository: Repository<StarknetTransaction>,
    private readonly configService: ConfigService,
  ) {
    const nodeUrl = this.configService.get<string>("STARKNET_NODE_URL")
    this.provider = new RpcProvider({ nodeUrl })
  }

  async trackTransaction(
    transactionHash: string,
    operation: string,
    entityId: string,
    entityType: string,
    userId: string,
  ): Promise<StarknetTransaction> {
    const transaction = this.transactionRepository.create({
      transactionHash,
      operation,
      entityId,
      entityType,
      userId,
      status: TransactionStatus.PENDING,
      submittedAt: new Date(),
    })

    const savedTransaction = await this.transactionRepository.save(transaction)

    // Start monitoring the transaction
    this.monitorTransaction(savedTransaction.id)

    return savedTransaction
  }

  async getTransactionStatus(transactionHash: string): Promise<TransactionStatus> {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash)

      switch (receipt.execution_status) {
        case "SUCCEEDED":
          return receipt.finality_status === "ACCEPTED_ON_L1"
            ? TransactionStatus.ACCEPTED_ON_L1
            : TransactionStatus.ACCEPTED_ON_L2
        case "REVERTED":
          return TransactionStatus.REJECTED
        default:
          return TransactionStatus.PENDING
      }
    } catch (error) {
      if (error.message.includes("Transaction hash not found")) {
        return TransactionStatus.PENDING
      }
      this.logger.error(`Failed to get transaction status for ${transactionHash}: ${error.message}`)
      return TransactionStatus.FAILED
    }
  }

  async updateTransactionStatus(id: string, status: TransactionStatus, receipt?: any): Promise<void> {
    const updateData: Partial<StarknetTransaction> = { status }

    if (status === TransactionStatus.ACCEPTED_ON_L2) {
      updateData.confirmedAt = new Date()
    } else if (status === TransactionStatus.ACCEPTED_ON_L1) {
      updateData.finalizedAt = new Date()
    } else if (status === TransactionStatus.REJECTED || status === TransactionStatus.FAILED) {
      updateData.failedAt = new Date()
      if (receipt?.revert_reason) {
        updateData.errorMessage = receipt.revert_reason
      }
    }

    if (receipt) {
      updateData.receipt = receipt
      updateData.gasUsed = receipt.actual_fee ? Number.parseInt(receipt.actual_fee, 16) : null
    }

    await this.transactionRepository.update(id, updateData)
  }

  async getPendingTransactions(): Promise<StarknetTransaction[]> {
    return this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
      order: { submittedAt: "ASC" },
    })
  }

  async getTransactionsByEntity(entityId: string, entityType: string): Promise<StarknetTransaction[]> {
    return this.transactionRepository.find({
      where: { entityId, entityType },
      order: { submittedAt: "DESC" },
    })
  }

  async getTransactionsByUser(userId: string): Promise<StarknetTransaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { submittedAt: "DESC" },
    })
  }

  private async monitorTransaction(transactionId: string): Promise<void> {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } })
    if (!transaction) {
      return
    }

    const maxRetries = 60 // Monitor for up to 60 attempts (about 10 minutes with 10-second intervals)
    let retries = 0

    const monitor = async () => {
      try {
        const status = await this.getTransactionStatus(transaction.transactionHash)

        if (status !== TransactionStatus.PENDING) {
          const receipt = await this.provider.getTransactionReceipt(transaction.transactionHash)
          await this.updateTransactionStatus(transactionId, status, receipt)
          this.logger.log(`Transaction ${transaction.transactionHash} status updated to ${status}`)
          return
        }

        retries++
        if (retries < maxRetries) {
          setTimeout(monitor, 10000) // Check again in 10 seconds
        } else {
          await this.updateTransactionStatus(transactionId, TransactionStatus.FAILED)
          this.logger.warn(`Transaction ${transaction.transactionHash} monitoring timed out`)
        }
      } catch (error) {
        this.logger.error(`Error monitoring transaction ${transaction.transactionHash}: ${error.message}`)
        retries++
        if (retries < maxRetries) {
          setTimeout(monitor, 10000)
        } else {
          await this.updateTransactionStatus(transactionId, TransactionStatus.FAILED)
        }
      }
    }

    // Start monitoring after a short delay
    setTimeout(monitor, 5000)
  }

  async getTransactionStatistics(): Promise<{
    total: number
    pending: number
    confirmed: number
    finalized: number
    failed: number
    averageConfirmationTime: number
  }> {
    const total = await this.transactionRepository.count()
    const pending = await this.transactionRepository.count({ where: { status: TransactionStatus.PENDING } })
    const confirmed = await this.transactionRepository.count({ where: { status: TransactionStatus.ACCEPTED_ON_L2 } })
    const finalized = await this.transactionRepository.count({ where: { status: TransactionStatus.ACCEPTED_ON_L1 } })
    const failed = await this.transactionRepository.count({
      where: [{ status: TransactionStatus.REJECTED }, { status: TransactionStatus.FAILED }],
    })

    // Calculate average confirmation time
    const avgConfirmationTime = await this.transactionRepository
      .createQueryBuilder("tx")
      .select("AVG(EXTRACT(EPOCH FROM (tx.confirmedAt - tx.submittedAt)))", "avgSeconds")
      .where("tx.confirmedAt IS NOT NULL")
      .getRawOne()

    return {
      total,
      pending,
      confirmed,
      finalized,
      failed,
      averageConfirmationTime: Number.parseFloat(avgConfirmationTime?.avgSeconds || "0"),
    }
  }
}
