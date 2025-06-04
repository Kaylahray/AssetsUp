import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { Account, Contract, type Provider, RpcProvider, stark } from "starknet"
import * as fs from "fs"
import * as path from "path"

@Injectable()
export class StarknetService {
  private readonly logger = new Logger(StarknetService.name)
  private provider: Provider
  private account: Account
  private assetRegistryContract: Contract
  private assetTransferContract: Contract
  private assetLifecycleContract: Contract
  private inventoryRegistryContract: Contract
  private assetCheckoutContract: Contract
  private assetCertificateContract: Contract
  private auditTrailContract: Contract

  constructor(private configService: ConfigService) {
    // Initialize StarkNet provider
    const nodeUrl = this.configService.get<string>("STARKNET_NODE_URL")
    this.provider = new RpcProvider({ nodeUrl })

    // Initialize account
    const privateKey = this.configService.get<string>("STARKNET_PRIVATE_KEY")
    const accountAddress = this.configService.get<string>("STARKNET_ACCOUNT_ADDRESS")

    if (privateKey && accountAddress) {
      this.account = new Account(this.provider, accountAddress, privateKey)

      // Initialize contracts
      this.initializeContracts()
    } else {
      this.logger.warn("StarkNet credentials not provided. On-chain features will be disabled.")
    }
  }

  private async initializeContracts() {
    try {
      // Load contract addresses from config
      const assetRegistryAddress = this.configService.get<string>("STARKNET_ASSET_REGISTRY_ADDRESS")
      const assetTransferAddress = this.configService.get<string>("STARKNET_ASSET_TRANSFER_ADDRESS")
      const assetLifecycleAddress = this.configService.get<string>("STARKNET_ASSET_LIFECYCLE_ADDRESS")
      const inventoryRegistryAddress = this.configService.get<string>("STARKNET_INVENTORY_REGISTRY_ADDRESS")
      const assetCheckoutAddress = this.configService.get<string>("STARKNET_ASSET_CHECKOUT_ADDRESS")
      const assetCertificateAddress = this.configService.get<string>("STARKNET_ASSET_CERTIFICATE_ADDRESS")
      const auditTrailAddress = this.configService.get<string>("STARKNET_AUDIT_TRAIL_ADDRESS")

      // Load contract ABIs
      const assetRegistryAbi = this.loadContractAbi("asset_registry")
      const assetTransferAbi = this.loadContractAbi("asset_transfer")
      const assetLifecycleAbi = this.loadContractAbi("asset_lifecycle")
      const inventoryRegistryAbi = this.loadContractAbi("inventory_registry")
      const assetCheckoutAbi = this.loadContractAbi("asset_checkout")
      const assetCertificateAbi = this.loadContractAbi("asset_certificate")
      const auditTrailAbi = this.loadContractAbi("audit_trail")

      // Initialize contracts
      if (assetRegistryAddress && assetRegistryAbi) {
        this.assetRegistryContract = new Contract(assetRegistryAbi, assetRegistryAddress, this.provider)
        this.assetRegistryContract.connect(this.account)
      }

      if (assetTransferAddress && assetTransferAbi) {
        this.assetTransferContract = new Contract(assetTransferAbi, assetTransferAddress, this.provider)
        this.assetTransferContract.connect(this.account)
      }

      if (assetLifecycleAddress && assetLifecycleAbi) {
        this.assetLifecycleContract = new Contract(assetLifecycleAbi, assetLifecycleAddress, this.provider)
        this.assetLifecycleContract.connect(this.account)
      }

      if (inventoryRegistryAddress && inventoryRegistryAbi) {
        this.inventoryRegistryContract = new Contract(inventoryRegistryAbi, inventoryRegistryAddress, this.provider)
        this.inventoryRegistryContract.connect(this.account)
      }

      if (assetCheckoutAddress && assetCheckoutAbi) {
        this.assetCheckoutContract = new Contract(assetCheckoutAbi, assetCheckoutAddress, this.provider)
        this.assetCheckoutContract.connect(this.account)
      }

      if (assetCertificateAddress && assetCertificateAbi) {
        this.assetCertificateContract = new Contract(assetCertificateAbi, assetCertificateAddress, this.provider)
        this.assetCertificateContract.connect(this.account)
      }

      if (auditTrailAddress && auditTrailAbi) {
        this.auditTrailContract = new Contract(auditTrailAbi, auditTrailAddress, this.provider)
        this.auditTrailContract.connect(this.account)
      }

      this.logger.log("StarkNet contracts initialized successfully")
    } catch (error) {
      this.logger.error(`Failed to initialize StarkNet contracts: ${error.message}`)
    }
  }

  private loadContractAbi(contractName: string): any {
    try {
      const abiPath = path.join(process.cwd(), "starknet", "artifacts", `${contractName}.json`)
      const abiJson = fs.readFileSync(abiPath, "utf8")
      return JSON.parse(abiJson).abi
    } catch (error) {
      this.logger.error(`Failed to load ABI for ${contractName}: ${error.message}`)
      return null
    }
  }

  // Asset Registry Methods
  async registerAsset(asset: any): Promise<string | null> {
    if (!this.assetRegistryContract) {
      this.logger.warn("Asset registry contract not initialized")
      return null
    }

    try {
      // Convert asset data to felt (field element) format for StarkNet
      const assetId = stark.makeSelector(asset.id)
      const assetName = this.stringToFelt(asset.name)
      const assetTag = this.stringToFelt(asset.assetTag)
      const serialNumber = this.stringToFelt(asset.serialNumber)
      const category = this.stringToFelt(asset.category)
      const status = this.stringToFelt(asset.status)

      // Call the contract method
      const result = await this.assetRegistryContract.invoke("register_asset", [
        assetId,
        assetName,
        assetTag,
        serialNumber,
        category,
        status,
      ])

      // Return the transaction hash as the on-chain ID
      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to register asset on StarkNet: ${error.message}`)
      return null
    }
  }

  async getAssetDetails(assetId: string): Promise<any | null> {
    if (!this.assetRegistryContract) {
      this.logger.warn("Asset registry contract not initialized")
      return null
    }

    try {
      const feltAssetId = stark.makeSelector(assetId)
      const result = await this.assetRegistryContract.call("get_asset", [feltAssetId])

      return {
        id: assetId,
        name: this.feltToString(result.name),
        assetTag: this.feltToString(result.asset_tag),
        serialNumber: this.feltToString(result.serial_number),
        category: this.feltToString(result.category),
        status: this.feltToString(result.status),
        owner: this.feltToString(result.owner),
        registeredAt: Number(result.registered_at),
      }
    } catch (error) {
      this.logger.error(`Failed to get asset details from StarkNet: ${error.message}`)
      return null
    }
  }

  // Asset Transfer Methods
  async transferAssetOwnership(asset: any, newOwnerId: string): Promise<string | null> {
    if (!this.assetTransferContract) {
      this.logger.warn("Asset transfer contract not initialized")
      return null
    }

    try {
      const assetId = stark.makeSelector(asset.id)
      const newOwner = this.stringToFelt(newOwnerId)

      const result = await this.assetTransferContract.invoke("transfer_ownership", [assetId, newOwner])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to transfer asset ownership on StarkNet: ${error.message}`)
      return null
    }
  }

  async getAssetTransferHistory(assetId: string): Promise<any[]> {
    if (!this.assetTransferContract) {
      this.logger.warn("Asset transfer contract not initialized")
      return []
    }

    try {
      const feltAssetId = stark.makeSelector(assetId)
      const result = await this.assetTransferContract.call("get_transfer_history", [feltAssetId])

      // Parse the result into a more usable format
      const history = []
      for (let i = 0; i < result.length; i += 3) {
        history.push({
          fromOwner: this.feltToString(result[i]),
          toOwner: this.feltToString(result[i + 1]),
          timestamp: Number(result[i + 2]),
        })
      }

      return history
    } catch (error) {
      this.logger.error(`Failed to get asset transfer history from StarkNet: ${error.message}`)
      return []
    }
  }

  // Asset Lifecycle Methods
  async decommissionAsset(assetId: string): Promise<string | null> {
    if (!this.assetLifecycleContract) {
      this.logger.warn("Asset lifecycle contract not initialized")
      return null
    }

    try {
      const feltAssetId = stark.makeSelector(assetId)
      const result = await this.assetLifecycleContract.invoke("decommission_asset", [feltAssetId])
      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to decommission asset on StarkNet: ${error.message}`)
      return null
    }
  }

  async recordMaintenanceLog(assetId: string, maintenanceId: string): Promise<string | null> {
    if (!this.assetLifecycleContract) {
      this.logger.warn("Asset lifecycle contract not initialized")
      return null
    }

    try {
      const feltAssetId = stark.makeSelector(assetId)
      const feltMaintenanceId = stark.makeSelector(maintenanceId)
      const timestamp = Math.floor(Date.now() / 1000)

      const result = await this.assetLifecycleContract.invoke("record_maintenance", [
        feltAssetId,
        feltMaintenanceId,
        timestamp,
      ])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to record maintenance log on StarkNet: ${error.message}`)
      return null
    }
  }

  // Inventory Registry Methods
  async registerInventoryItem(itemId: string, name: string, quantity: number, unit: string): Promise<string | null> {
    if (!this.inventoryRegistryContract) {
      this.logger.warn("Inventory registry contract not initialized")
      return null
    }

    try {
      const feltItemId = stark.makeSelector(itemId)
      const feltName = this.stringToFelt(name)
      const feltUnit = this.stringToFelt(unit)

      const result = await this.inventoryRegistryContract.invoke("register_item", [
        feltItemId,
        feltName,
        quantity,
        feltUnit,
      ])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to register inventory item on StarkNet: ${error.message}`)
      return null
    }
  }

  async recordStockTransaction(
    itemId: string,
    transactionType: string,
    quantity: number,
    quantityBefore: number,
    quantityAfter: number,
  ): Promise<string | null> {
    if (!this.inventoryRegistryContract) {
      this.logger.warn("Inventory registry contract not initialized")
      return null
    }

    try {
      const feltItemId = stark.makeSelector(itemId)
      const feltTransactionType = this.stringToFelt(transactionType)
      const timestamp = Math.floor(Date.now() / 1000)

      const result = await this.inventoryRegistryContract.invoke("record_transaction", [
        feltItemId,
        feltTransactionType,
        quantity,
        quantityBefore,
        quantityAfter,
        timestamp,
      ])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to record stock transaction on StarkNet: ${error.message}`)
      return null
    }
  }

  // Asset Checkout Methods
  async checkoutAsset(assetId: string, userId: string, dueDate: Date, purpose: string): Promise<string | null> {
    if (!this.assetCheckoutContract) {
      this.logger.warn("Asset checkout contract not initialized")
      return null
    }

    try {
      const feltAssetId = stark.makeSelector(assetId)
      const feltUserId = this.stringToFelt(userId)
      const feltPurpose = this.stringToFelt(purpose)
      const dueTime = Math.floor(dueDate.getTime() / 1000)

      const result = await this.assetCheckoutContract.invoke("checkout_asset", [
        feltAssetId,
        feltUserId,
        dueTime,
        feltPurpose,
      ])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to checkout asset on StarkNet: ${error.message}`)
      return null
    }
  }

  async checkinAsset(checkoutId: string, conditionNotes: string): Promise<string | null> {
    if (!this.assetCheckoutContract) {
      this.logger.warn("Asset checkout contract not initialized")
      return null
    }

    try {
      const feltCheckoutId = stark.makeSelector(checkoutId)
      const feltConditionNotes = this.stringToFelt(conditionNotes)

      const result = await this.assetCheckoutContract.invoke("checkin_asset", [feltCheckoutId, feltConditionNotes])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to checkin asset on StarkNet: ${error.message}`)
      return null
    }
  }

  // Asset Certificate Methods
  async issueCertificate(
    assetId: string,
    metadata: {
      name: string
      description: string
      imageUri: string
      attributes: string
      value: number
      currency: string
    },
  ): Promise<string | null> {
    if (!this.assetCertificateContract) {
      this.logger.warn("Asset certificate contract not initialized")
      return null
    }

    try {
      const feltAssetId = stark.makeSelector(assetId)
      const feltMetadata = {
        name: this.stringToFelt(metadata.name),
        description: this.stringToFelt(metadata.description),
        image_uri: this.stringToFelt(metadata.imageUri),
        attributes: this.stringToFelt(metadata.attributes),
        value: metadata.value,
        currency: this.stringToFelt(metadata.currency),
      }

      const result = await this.assetCertificateContract.invoke("issue_certificate", [feltAssetId, feltMetadata])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to issue certificate on StarkNet: ${error.message}`)
      return null
    }
  }

  async transferCertificate(certificateId: string, toUserId: string): Promise<string | null> {
    if (!this.assetCertificateContract) {
      this.logger.warn("Asset certificate contract not initialized")
      return null
    }

    try {
      const feltCertificateId = stark.makeSelector(certificateId)
      const feltToUserId = this.stringToFelt(toUserId)

      const result = await this.assetCertificateContract.invoke("transfer_certificate", [
        feltCertificateId,
        feltToUserId,
      ])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to transfer certificate on StarkNet: ${error.message}`)
      return null
    }
  }

  async revokeCertificate(certificateId: string, reason: string): Promise<string | null> {
    if (!this.assetCertificateContract) {
      this.logger.warn("Asset certificate contract not initialized")
      return null
    }

    try {
      const feltCertificateId = stark.makeSelector(certificateId)
      const feltReason = this.stringToFelt(reason)

      const result = await this.assetCertificateContract.invoke("revoke_certificate", [feltCertificateId, feltReason])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to revoke certificate on StarkNet: ${error.message}`)
      return null
    }
  }

  async verifyCertificate(certificateId: string): Promise<boolean> {
    if (!this.assetCertificateContract) {
      this.logger.warn("Asset certificate contract not initialized")
      return false
    }

    try {
      const feltCertificateId = stark.makeSelector(certificateId)
      const result = await this.assetCertificateContract.call("verify_certificate", [feltCertificateId])

      return result === 1
    } catch (error) {
      this.logger.error(`Failed to verify certificate on StarkNet: ${error.message}`)
      return false
    }
  }

  // Audit Trail Methods
  async createAuditLog(
    eventType: string,
    assetId: string,
    userId: string,
    action: string,
    details: string,
  ): Promise<{ logId: string; transactionHash: string } | null> {
    if (!this.auditTrailContract) {
      this.logger.warn("Audit trail contract not initialized")
      return null
    }

    try {
      // Map event type string to enum value
      const eventTypeMapping = {
        Registration: 0,
        Transfer: 1,
        Assignment: 2,
        TemporaryAssignment: 3,
        BatchAssignment: 4,
        Maintenance: 5,
        Decommission: 6,
        Checkout: 7,
        CheckIn: 8,
      }

      const eventTypeValue = eventTypeMapping[eventType] || 0

      const feltAssetId = stark.makeSelector(assetId)
      const feltUserId = this.stringToFelt(userId)
      const feltAction = this.stringToFelt(action)
      const feltDetails = this.stringToFelt(details)

      const result = await this.auditTrailContract.invoke("create_audit_log", [
        eventTypeValue,
        feltAssetId,
        feltUserId,
        feltAction,
        feltDetails,
      ])

      // Extract log ID from transaction receipt
      const receipt = await this.provider.getTransactionReceipt(result.transaction_hash)
      const logIdEvent = receipt.events.find((event) => event.keys[0] === "AuditLogCreated")
      const logId = logIdEvent ? logIdEvent.data[0] : null

      return {
        logId,
        transactionHash: result.transaction_hash,
      }
    } catch (error) {
      this.logger.error(`Failed to create audit log on StarkNet: ${error.message}`)
      return null
    }
  }

  async verifyAuditLog(logId: string): Promise<string | null> {
    if (!this.auditTrailContract) {
      this.logger.warn("Audit trail contract not initialized")
      return null
    }

    try {
      const feltLogId = stark.makeSelector(logId)
      const result = await this.auditTrailContract.invoke("verify_audit_log", [feltLogId])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to verify audit log on StarkNet: ${error.message}`)
      return null
    }
  }

  async getAuditLog(logId: string): Promise<any | null> {
    if (!this.auditTrailContract) {
      this.logger.warn("Audit trail contract not initialized")
      return null
    }

    try {
      const feltLogId = stark.makeSelector(logId)
      const result = await this.auditTrailContract.call("get_audit_log", [feltLogId])

      return {
        logId: result.log_id.toString(),
        timestamp: Number(result.timestamp),
        eventType: result.event_type,
        assetId: this.feltToString(result.asset_id),
        userId: this.feltToString(result.user_id),
        action: this.feltToString(result.action),
        details: this.feltToString(result.details),
        verified: result.verified === 1,
        verifier: result.verifier,
      }
    } catch (error) {
      this.logger.error(`Failed to get audit log from StarkNet: ${error.message}`)
      return null
    }
  }

  async getAssetAuditTrail(assetId: string): Promise<any[]> {
    if (!this.auditTrailContract) {
      this.logger.warn("Audit trail contract not initialized")
      return []
    }

    try {
      const feltAssetId = stark.makeSelector(assetId)
      const result = await this.auditTrailContract.call("get_asset_audit_trail", [feltAssetId])

      return result.map((log) => ({
        logId: log.log_id.toString(),
        timestamp: Number(log.timestamp),
        eventType: log.event_type,
        assetId: this.feltToString(log.asset_id),
        userId: this.feltToString(log.user_id),
        action: this.feltToString(log.action),
        details: this.feltToString(log.details),
        verified: log.verified === 1,
        verifier: log.verifier,
      }))
    } catch (error) {
      this.logger.error(`Failed to get asset audit trail from StarkNet: ${error.message}`)
      return []
    }
  }

  async verifyAuditChain(startIndex: number, endIndex: number): Promise<boolean> {
    if (!this.auditTrailContract) {
      this.logger.warn("Audit trail contract not initialized")
      return false
    }

    try {
      const result = await this.auditTrailContract.call("verify_audit_chain", [startIndex, endIndex])
      return result === 1
    } catch (error) {
      this.logger.error(`Failed to verify audit chain on StarkNet: ${error.message}`)
      return false
    }
  }

  // Batch operations for asset assignments
  async batchTransferAssets(assetIds: string[], newOwnerId: string): Promise<string | null> {
    if (!this.assetTransferContract) {
      this.logger.warn("Asset transfer contract not initialized")
      return null
    }

    try {
      const feltAssetIds = assetIds.map((id) => stark.makeSelector(id))
      const feltNewOwner = this.stringToFelt(newOwnerId)

      const result = await this.assetTransferContract.invoke("batch_transfer_ownership", [
        feltAssetIds.length,
        ...feltAssetIds,
        feltNewOwner,
      ])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to batch transfer assets on StarkNet: ${error.message}`)
      return null
    }
  }

  // Temporary assignment methods
  async recordTemporaryAssignment(assetId: string, userId: string, dueDate: number): Promise<string | null> {
    if (!this.assetTransferContract) {
      this.logger.warn("Asset transfer contract not initialized")
      return null
    }

    try {
      const feltAssetId = stark.makeSelector(assetId)
      const feltUserId = this.stringToFelt(userId)

      const result = await this.assetTransferContract.invoke("temporary_assignment", [feltAssetId, feltUserId, dueDate])

      return result.transaction_hash
    } catch (error) {
      this.logger.error(`Failed to record temporary assignment on StarkNet: ${error.message}`)
      return null
    }
  }

  // Utility methods for string/felt conversion
  private stringToFelt(str: string): string {
    return "0x" + Buffer.from(str).toString("hex")
  }

  private feltToString(felt: string): string {
    // Remove '0x' prefix if present
    const hex = felt.startsWith("0x") ? felt.slice(2) : felt

    // Convert hex to buffer and then to string
    const buf = Buffer.from(hex, "hex")
    return buf.toString()
  }
}
