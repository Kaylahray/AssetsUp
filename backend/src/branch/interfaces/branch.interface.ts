export interface IBranchLocation {
  latitude: number
  longitude: number
}

export interface IBranchOperatingHours {
  [day: string]: {
    open: string
    close: string
    closed?: boolean
  }
}

export interface IBranchStats {
  totalAssets: number
  activeAssets: number
  totalInventories: number
  totalUsers: number
  totalTransactions: number
}

export interface IBranchSummary {
  id: string
  name: string
  branchCode: string
  city: string
  state: string
  country: string
  isActive: boolean
  stats: IBranchStats
}

export interface IBranchTransferLog {
  id: string
  fromBranchId: string
  toBranchId: string
  assetIds: string[]
  transferredBy: string
  transferReason?: string
  notes?: string
  transferredAt: Date
}
