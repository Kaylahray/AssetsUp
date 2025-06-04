import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { Account, Contract, type Provider, RpcProvider } from "starknet"
import * as fs from "fs"
import * as path from "path"

export interface DeploymentConfig {
  contractName: string
  constructorCalldata?: any[]
  salt?: string
  unique?: boolean
}

export interface DeploymentResult {
  contractAddress: string
  transactionHash: string
  classHash: string
  deploymentTime: Date
}

@Injectable()
export class ContractDeploymentService {
  private readonly logger = new Logger(ContractDeploymentService.name)
  private provider: Provider
  private account: Account

  constructor(private configService: ConfigService) {
    const nodeUrl = this.configService.get<string>("STARKNET_NODE_URL")
    this.provider = new RpcProvider({ nodeUrl })

    const privateKey = this.configService.get<string>("STARKNET_PRIVATE_KEY")
    const accountAddress = this.configService.get<string>("STARKNET_ACCOUNT_ADDRESS")

    if (privateKey && accountAddress) {
      this.account = new Account(this.provider, accountAddress, privateKey)
    }
  }

  async deployContract(config: DeploymentConfig): Promise<DeploymentResult> {
    try {
      this.logger.log(`Deploying contract: ${config.contractName}`)

      // Load contract artifacts
      const contractArtifacts = this.loadContractArtifacts(config.contractName)
      if (!contractArtifacts) {
        throw new Error(`Contract artifacts not found for ${config.contractName}`)
      }

      // Declare the contract class if not already declared
      const classHash = await this.declareContract(contractArtifacts)

      // Deploy the contract
      const deployResult = await this.account.deployContract({
        classHash,
        constructorCalldata: config.constructorCalldata || [],
        salt: config.salt,
        unique: config.unique || false,
      })

      // Wait for transaction confirmation
      await this.provider.waitForTransaction(deployResult.transaction_hash)

      const result: DeploymentResult = {
        contractAddress: deployResult.contract_address,
        transactionHash: deployResult.transaction_hash,
        classHash,
        deploymentTime: new Date(),
      }

      this.logger.log(`Contract deployed successfully: ${result.contractAddress}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to deploy contract ${config.contractName}: ${error.message}`)
      throw error
    }
  }

  async deployAllContracts(): Promise<Record<string, DeploymentResult>> {
    const contracts = [
      "asset_registry",
      "asset_lifecycle",
      "asset_transfer",
      "asset_checkout",
      "asset_certificate",
      "audit_trail",
      "inventory_registry",
    ]

    const deploymentResults: Record<string, DeploymentResult> = {}

    for (const contractName of contracts) {
      try {
        const result = await this.deployContract({ contractName })
        deploymentResults[contractName] = result

        // Save deployment info to environment or config
        await this.saveDeploymentInfo(contractName, result)
      } catch (error) {
        this.logger.error(`Failed to deploy ${contractName}: ${error.message}`)
        throw error
      }
    }

    // Deploy the main asset manager contract with references to other contracts
    const assetManagerResult = await this.deployAssetManager(deploymentResults)
    deploymentResults.asset_manager = assetManagerResult

    return deploymentResults
  }

  private async declareContract(contractArtifacts: any): Promise<string> {
    try {
      const declareResult = await this.account.declare({
        contract: contractArtifacts.sierra,
        casm: contractArtifacts.casm,
      })

      await this.provider.waitForTransaction(declareResult.transaction_hash)
      return declareResult.class_hash
    } catch (error) {
      // If contract is already declared, extract class hash from error
      if (error.message.includes("is already declared")) {
        const classHashMatch = error.message.match(/0x[a-fA-F0-9]+/)
        if (classHashMatch) {
          return classHashMatch[0]
        }
      }
      throw error
    }
  }

  private async deployAssetManager(contractAddresses: Record<string, DeploymentResult>): Promise<DeploymentResult> {
    const constructorCalldata = [
      contractAddresses.asset_registry.contractAddress,
      contractAddresses.asset_lifecycle.contractAddress,
      contractAddresses.asset_transfer.contractAddress,
      contractAddresses.asset_checkout.contractAddress,
      contractAddresses.asset_certificate.contractAddress,
      contractAddresses.audit_trail.contractAddress,
      contractAddresses.inventory_registry.contractAddress,
    ]

    return this.deployContract({
      contractName: "asset_manager",
      constructorCalldata,
    })
  }

  private loadContractArtifacts(contractName: string): any {
    try {
      const artifactsDir = path.join(process.cwd(), "starknet", "target", "dev")
      const sierraPath = path.join(artifactsDir, `${contractName}.contract_class.json`)
      const casmPath = path.join(artifactsDir, `${contractName}.compiled_contract_class.json`)

      if (!fs.existsSync(sierraPath) || !fs.existsSync(casmPath)) {
        return null
      }

      const sierra = JSON.parse(fs.readFileSync(sierraPath, "utf8"))
      const casm = JSON.parse(fs.readFileSync(casmPath, "utf8"))

      return { sierra, casm }
    } catch (error) {
      this.logger.error(`Failed to load contract artifacts for ${contractName}: ${error.message}`)
      return null
    }
  }

  private async saveDeploymentInfo(contractName: string, result: DeploymentResult): Promise<void> {
    try {
      const deploymentInfo = {
        contractName,
        ...result,
      }

      const deploymentDir = path.join(process.cwd(), "starknet", "deployments")
      if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true })
      }

      const deploymentFile = path.join(deploymentDir, `${contractName}.json`)
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2))

      this.logger.log(`Deployment info saved for ${contractName}`)
    } catch (error) {
      this.logger.error(`Failed to save deployment info for ${contractName}: ${error.message}`)
    }
  }

  async verifyContract(contractAddress: string, contractName: string): Promise<boolean> {
    try {
      // Load contract ABI
      const abi = this.loadContractAbi(contractName)
      if (!abi) {
        throw new Error(`ABI not found for ${contractName}`)
      }

      // Create contract instance
      const contract = new Contract(abi, contractAddress, this.provider)

      // Try to call a read-only function to verify the contract
      await contract.call("get_version")

      this.logger.log(`Contract ${contractName} at ${contractAddress} verified successfully`)
      return true
    } catch (error) {
      this.logger.error(`Failed to verify contract ${contractName} at ${contractAddress}: ${error.message}`)
      return false
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
}
