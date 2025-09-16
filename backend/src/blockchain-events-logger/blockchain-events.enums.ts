export enum BlockchainEventType {
  ASSET_TRANSFER = 'asset_transfer',
  ASSET_PURCHASE = 'asset_purchase',
  ASSET_DISPOSAL = 'asset_disposal',
  ASSET_CREATION = 'asset_creation',
  ASSET_UPDATE = 'asset_update',
  ASSET_MAINTENANCE = 'asset_maintenance',
  ASSET_AUDIT = 'asset_audit',
  ASSET_DEPRECIATION = 'asset_depreciation',
  ASSET_INSURANCE_CLAIM = 'asset_insurance_claim',
  ASSET_WARRANTY_CLAIM = 'asset_warranty_claim',
  CONTRACT_DEPLOYMENT = 'contract_deployment',
  CONTRACT_UPGRADE = 'contract_upgrade',
}

export enum BlockchainNetwork {
  STARKNET_MAINNET = 'starknet_mainnet',
  STARKNET_TESTNET = 'starknet_testnet',
  STARKNET_SEPOLIA = 'starknet_sepolia',
}

export enum EventStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REVERTED = 'reverted',
}

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
