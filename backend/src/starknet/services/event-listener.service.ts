import { Injectable, Logger, type OnModuleInit } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { type Provider, RpcProvider } from "starknet"
import type { AuditService } from "../../audit/audit.service"
import type { NotificationsService } from "../../notifications/notifications.service"

@Injectable()
export class EventListenerService implements OnModuleInit {
  private readonly logger = new Logger(EventListenerService.name)
  private provider: Provider
  private isListening = false

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {
    const nodeUrl = this.configService.get<string>("STARKNET_NODE_URL")
    this.provider = new RpcProvider({ nodeUrl })
  }

  async onModuleInit() {
    // Start listening to events when the module initializes
    await this.startListening()
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      return
    }

    this.isListening = true
    this.logger.log("Starting StarkNet event listener...")

    try {
      // Get contract addresses from configuration
      const contractAddresses = this.getContractAddresses()

      // Start listening to events from all contracts
      for (const [contractName, address] of Object.entries(contractAddresses)) {
        if (address) {
          this.listenToContractEvents(contractName, address)
        }
      }
    } catch (error) {
      this.logger.error(`Failed to start event listener: ${error.message}`)
      this.isListening = false
    }
  }

  async stopListening(): Promise<void> {
    this.isListening = false
    this.logger.log("Stopped StarkNet event listener")
  }

  private getContractAddresses(): Record<string, string> {
    return {
      asset_registry: this.configService.get<string>("STARKNET_ASSET_REGISTRY_ADDRESS"),
      asset_lifecycle: this.configService.get<string>("STARKNET_ASSET_LIFECYCLE_ADDRESS"),
      asset_transfer: this.configService.get<string>("STARKNET_ASSET_TRANSFER_ADDRESS"),
      asset_checkout: this.configService.get<string>("STARKNET_ASSET_CHECKOUT_ADDRESS"),
      asset_certificate: this.configService.get<string>("STARKNET_ASSET_CERTIFICATE_ADDRESS"),
      audit_trail: this.configService.get<string>("STARKNET_AUDIT_TRAIL_ADDRESS"),
      inventory_registry: this.configService.get<string>("STARKNET_INVENTORY_REGISTRY_ADDRESS"),
      asset_manager: this.configService.get<string>("STARKNET_ASSET_MANAGER_ADDRESS"),
    }
  }

  private async listenToContractEvents(contractName: string, contractAddress: string): Promise<void> {
    try {
      this.logger.log(`Starting to listen to events from ${contractName} at ${contractAddress}`)

      // Get the latest block number to start listening from
      let fromBlock = await this.provider.getBlockNumber()

      const pollInterval = 10000 // Poll every 10 seconds

      const poll = async () => {
        if (!this.isListening) {
          return
        }

        try {
          const toBlock = await this.provider.getBlockNumber()

          if (toBlock > fromBlock) {
            const events = await this.provider.getEvents({
              from_block: { block_number: fromBlock + 1 },
              to_block: { block_number: toBlock },
              address: contractAddress,
              chunk_size: 100,
            })

            for (const event of events.events) {
              await this.processEvent(contractName, event)
            }

            fromBlock = toBlock
          }
        } catch (error) {
          this.logger.error(`Error polling events for ${contractName}: ${error.message}`)
        }

        // Schedule next poll
        setTimeout(poll, pollInterval)
      }

      // Start polling
      setTimeout(poll, pollInterval)
    } catch (error) {
      this.logger.error(`Failed to start listening to ${contractName} events: ${error.message}`)
    }
  }

  private async processEvent(contractName: string, event: any): Promise<void> {
    try {
      const eventName = this.decodeEventName(event.keys[0])
      this.logger.log(`Processing event ${eventName} from ${contractName}`)

      switch (contractName) {
        case "asset_registry":
          await this.processAssetRegistryEvent(eventName, event)
          break
        case "asset_lifecycle":
          await this.processAssetLifecycleEvent(eventName, event)
          break
        case "asset_transfer":
          await this.processAssetTransferEvent(eventName, event)
          break
        case "asset_checkout":
          await this.processAssetCheckoutEvent(eventName, event)
          break
        case "asset_certificate":
          await this.processAssetCertificateEvent(eventName, event)
          break
        case "audit_trail":
          await this.processAuditTrailEvent(eventName, event)
          break
        case "inventory_registry":
          await this.processInventoryRegistryEvent(eventName, event)
          break
        default:
          this.logger.warn(`Unknown contract: ${contractName}`)
      }
    } catch (error) {
      this.logger.error(`Error processing event: ${error.message}`)
    }
  }

  private async processAssetRegistryEvent(eventName: string, event: any): Promise<void> {
    switch (eventName) {
      case "AssetRegistered":
        await this.handleAssetRegistered(event)
        break
      case "AssetUpdated":
        await this.handleAssetUpdated(event)
        break
      default:
        this.logger.debug(`Unhandled asset registry event: ${eventName}`)
    }
  }

  private async processAssetLifecycleEvent(eventName: string, event: any): Promise<void> {
    switch (eventName) {
      case "AssetDecommissioned":
        await this.handleAssetDecommissioned(event)
        break
      case "MaintenanceRecorded":
        await this.handleMaintenanceRecorded(event)
        break
      default:
        this.logger.debug(`Unhandled asset lifecycle event: ${eventName}`)
    }
  }

  private async processAssetTransferEvent(eventName: string, event: any): Promise<void> {
    switch (eventName) {
      case "OwnershipTransferred":
        await this.handleOwnershipTransferred(event)
        break
      case "BatchTransferCompleted":
        await this.handleBatchTransferCompleted(event)
        break
      case "TemporaryAssignmentCreated":
        await this.handleTemporaryAssignmentCreated(event)
        break
      default:
        this.logger.debug(`Unhandled asset transfer event: ${eventName}`)
    }
  }

  private async processAssetCheckoutEvent(eventName: string, event: any): Promise<void> {
    switch (eventName) {
      case "AssetCheckedOut":
        await this.handleAssetCheckedOut(event)
        break
      case "AssetCheckedIn":
        await this.handleAssetCheckedIn(event)
        break
      case "CheckoutOverdue":
        await this.handleCheckoutOverdue(event)
        break
      default:
        this.logger.debug(`Unhandled asset checkout event: ${eventName}`)
    }
  }

  private async processAssetCertificateEvent(eventName: string, event: any): Promise<void> {
    switch (eventName) {
      case "CertificateIssued":
        await this.handleCertificateIssued(event)
        break
      case "CertificateTransferred":
        await this.handleCertificateTransferred(event)
        break
      case "CertificateRevoked":
        await this.handleCertificateRevoked(event)
        break
      default:
        this.logger.debug(`Unhandled asset certificate event: ${eventName}`)
    }
  }

  private async processAuditTrailEvent(eventName: string, event: any): Promise<void> {
    switch (eventName) {
      case "AuditLogCreated":
        await this.handleAuditLogCreated(event)
        break
      case "AuditLogVerified":
        await this.handleAuditLogVerified(event)
        break
      default:
        this.logger.debug(`Unhandled audit trail event: ${eventName}`)
    }
  }

  private async processInventoryRegistryEvent(eventName: string, event: any): Promise<void> {
    switch (eventName) {
      case "InventoryItemRegistered":
        await this.handleInventoryItemRegistered(event)
        break
      case "StockTransactionRecorded":
        await this.handleStockTransactionRecorded(event)
        break
      default:
        this.logger.debug(`Unhandled inventory registry event: ${eventName}`)
    }
  }

  // Event handlers
  private async handleAssetRegistered(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])

    await this.notificationsService.createNotification({
      title: "Asset Registered on Blockchain",
      message: `Asset ${assetId} has been successfully registered on the blockchain`,
      type: "success",
      data: {
        assetId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleAssetUpdated(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])

    await this.notificationsService.createNotification({
      title: "Asset Updated on Blockchain",
      message: `Asset ${assetId} has been updated on the blockchain`,
      type: "info",
      data: {
        assetId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleAssetDecommissioned(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])

    await this.notificationsService.createNotification({
      title: "Asset Decommissioned",
      message: `Asset ${assetId} has been decommissioned and recorded on the blockchain`,
      type: "warning",
      data: {
        assetId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleMaintenanceRecorded(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])
    const maintenanceId = this.feltToString(event.data[1])

    await this.notificationsService.createNotification({
      title: "Maintenance Recorded",
      message: `Maintenance record for asset ${assetId} has been recorded on the blockchain`,
      type: "info",
      data: {
        assetId,
        maintenanceId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleOwnershipTransferred(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])
    const fromOwner = this.feltToString(event.data[1])
    const toOwner = this.feltToString(event.data[2])

    await this.notificationsService.createNotification({
      title: "Asset Ownership Transferred",
      message: `Asset ${assetId} ownership has been transferred from ${fromOwner} to ${toOwner}`,
      type: "info",
      data: {
        assetId,
        fromOwner,
        toOwner,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleBatchTransferCompleted(event: any): Promise<void> {
    const batchId = this.feltToString(event.data[0])
    const assetCount = Number.parseInt(event.data[1], 16)

    await this.notificationsService.createNotification({
      title: "Batch Transfer Completed",
      message: `Batch transfer ${batchId} completed for ${assetCount} assets`,
      type: "success",
      data: {
        batchId,
        assetCount,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleTemporaryAssignmentCreated(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])
    const userId = this.feltToString(event.data[1])
    const dueDate = Number.parseInt(event.data[2], 16)

    await this.notificationsService.createNotification({
      title: "Temporary Assignment Created",
      message: `Asset ${assetId} has been temporarily assigned to user ${userId}`,
      type: "info",
      data: {
        assetId,
        userId,
        dueDate: new Date(dueDate * 1000),
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleAssetCheckedOut(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])
    const userId = this.feltToString(event.data[1])

    await this.notificationsService.createNotification({
      title: "Asset Checked Out",
      message: `Asset ${assetId} has been checked out by user ${userId}`,
      type: "info",
      data: {
        assetId,
        userId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleAssetCheckedIn(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])
    const userId = this.feltToString(event.data[1])

    await this.notificationsService.createNotification({
      title: "Asset Checked In",
      message: `Asset ${assetId} has been checked in by user ${userId}`,
      type: "success",
      data: {
        assetId,
        userId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleCheckoutOverdue(event: any): Promise<void> {
    const assetId = this.feltToString(event.data[0])
    const userId = this.feltToString(event.data[1])

    await this.notificationsService.createNotification({
      title: "Asset Checkout Overdue",
      message: `Asset ${assetId} checkout by user ${userId} is overdue`,
      type: "error",
      data: {
        assetId,
        userId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleCertificateIssued(event: any): Promise<void> {
    const certificateId = this.feltToString(event.data[0])
    const assetId = this.feltToString(event.data[1])
    const ownerId = this.feltToString(event.data[2])

    await this.notificationsService.createNotification({
      title: "Asset Certificate Issued",
      message: `Certificate ${certificateId} has been issued for asset ${assetId}`,
      type: "success",
      data: {
        certificateId,
        assetId,
        ownerId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleCertificateTransferred(event: any): Promise<void> {
    const certificateId = this.feltToString(event.data[0])
    const fromOwner = this.feltToString(event.data[1])
    const toOwner = this.feltToString(event.data[2])

    await this.notificationsService.createNotification({
      title: "Certificate Transferred",
      message: `Certificate ${certificateId} has been transferred from ${fromOwner} to ${toOwner}`,
      type: "info",
      data: {
        certificateId,
        fromOwner,
        toOwner,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleCertificateRevoked(event: any): Promise<void> {
    const certificateId = this.feltToString(event.data[0])
    const reason = this.feltToString(event.data[1])

    await this.notificationsService.createNotification({
      title: "Certificate Revoked",
      message: `Certificate ${certificateId} has been revoked. Reason: ${reason}`,
      type: "warning",
      data: {
        certificateId,
        reason,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleAuditLogCreated(event: any): Promise<void> {
    const logId = this.feltToString(event.data[0])
    const assetId = this.feltToString(event.data[1])

    await this.notificationsService.createNotification({
      title: "Audit Log Created",
      message: `Audit log ${logId} has been created for asset ${assetId}`,
      type: "info",
      data: {
        logId,
        assetId,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleAuditLogVerified(event: any): Promise<void> {
    const logId = this.feltToString(event.data[0])
    const verifier = this.feltToString(event.data[1])

    await this.notificationsService.createNotification({
      title: "Audit Log Verified",
      message: `Audit log ${logId} has been verified by ${verifier}`,
      type: "success",
      data: {
        logId,
        verifier,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleInventoryItemRegistered(event: any): Promise<void> {
    const itemId = this.feltToString(event.data[0])
    const name = this.feltToString(event.data[1])

    await this.notificationsService.createNotification({
      title: "Inventory Item Registered",
      message: `Inventory item ${name} (${itemId}) has been registered on the blockchain`,
      type: "info",
      data: {
        itemId,
        name,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private async handleStockTransactionRecorded(event: any): Promise<void> {
    const itemId = this.feltToString(event.data[0])
    const transactionType = this.feltToString(event.data[1])
    const quantity = Number.parseInt(event.data[2], 16)

    await this.notificationsService.createNotification({
      title: "Stock Transaction Recorded",
      message: `Stock transaction recorded for item ${itemId}: ${transactionType} ${quantity} units`,
      type: "info",
      data: {
        itemId,
        transactionType,
        quantity,
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
      },
    })
  }

  private decodeEventName(eventKey: string): string {
    // Convert felt to string to get event name
    try {
      return this.feltToString(eventKey)
    } catch {
      return eventKey
    }
  }

  private feltToString(felt: string): string {
    // Remove '0x' prefix if present
    const hex = felt.startsWith("0x") ? felt.slice(2) : felt

    // Convert hex to buffer and then to string
    const buf = Buffer.from(hex, "hex")
    return buf.toString().replace(/\0/g, "") // Remove null characters
  }
}
