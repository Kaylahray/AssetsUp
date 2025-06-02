// User types
export interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
  position?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Department types
export interface Department {
  id: string
  name: string
  description?: string
  managerId?: string
  manager?: User
  createdAt: string
  updatedAt: string
}

// Branch types
export interface Branch {
  id: string
  name: string
  address: string
  city: string
  state?: string
  country: string
  phone?: string
  email?: string
  managerId?: string
  manager?: User
  createdAt: string
  updatedAt: string
}

// Asset types
export interface Asset {
  id: string
  name: string
  description?: string
  assetTag?: string
  serialNumber?: string
  category: string
  status: AssetStatus
  condition: AssetCondition
  purchaseDate?: string
  purchasePrice?: number
  supplier?: string
  warrantyExpiration?: string
  location?: string
  department?: string
  notes?: string
  assignedTo?: User
  assignedToId?: string
  assignedToType?: "user" | "department"
  onChainId?: string
  createdAt: string
  updatedAt: string
}

export type AssetStatus = "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "DECOMMISSIONED" | "LOST" | "DISPOSED"

export type AssetCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DAMAGED"

// Asset Assignment types
export interface AssetAssignment {
  id: string
  assetId: string
  asset: Asset
  assigneeId: string
  assigneeName: string
  assigneeType: "user" | "department"
  assignmentType: "permanent" | "temporary"
  status: "active" | "returned" | "overdue"
  startDate: string
  dueDate?: string
  returnDate?: string
  notes?: string
  onChainId?: string
  createdAt: string
  updatedAt: string
}

// Asset Transfer types
export interface AssetTransfer {
  id: string
  assetId: string
  asset: Asset
  fromOwnerId: string
  fromOwnerName: string
  fromOwnerType: "user" | "department"
  toOwnerId: string
  toOwnerName: string
  toOwnerType: "user" | "department"
  date: string
  reason: string
  notes?: string
  status: "pending" | "completed" | "rejected"
  onChainId?: string
  createdAt: string
  updatedAt: string
}

export type TransferType =
  | "USER_TO_USER"
  | "USER_TO_DEPARTMENT"
  | "DEPARTMENT_TO_USER"
  | "DEPARTMENT_TO_DEPARTMENT"
  | "INITIAL_ASSIGNMENT"

// Maintenance types
export interface MaintenanceRecord {
  id: string
  assetId: string
  asset: Asset
  maintenanceType: "preventive" | "corrective" | "predictive"
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  description: string
  scheduledDate: string
  completedDate?: string
  cost?: number
  performedBy?: string
  notes?: string
  onChainId?: string
  createdAt: string
  updatedAt: string
}

// Inventory types
export interface InventoryItem {
  id: string
  name: string
  sku: string
  description?: string
  category: string
  quantity: number
  unit: string
  cost: number
  reorderPoint: number
  department?: string
  location?: string
  supplierId?: string
  notes?: string
  isLowStock: boolean
  isOutOfStock: boolean
  onChainId?: string
  createdAt: string
  updatedAt: string
}

export interface StockTransaction {
  id: string
  inventoryItemId: string
  inventoryItem?: InventoryItem
  type: "stock_in" | "stock_out" | "adjustment" | "return" | "damage" | "expired"
  quantity: number
  quantityBefore: number
  quantityAfter: number
  referenceNumber?: string
  reason?: string
  requestedBy?: string
  department?: string
  performedById?: string
  performedBy?: User
  onChainId?: string
  createdAt: string
  updatedAt: string
}

// Notification types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  referenceId?: string
  read: boolean
  createdAt: string
  updatedAt: string
}

export type NotificationType =
  | "asset_assignment"
  | "asset_transfer"
  | "asset_return"
  | "maintenance_due"
  | "maintenance_completed"
  | "low_stock"
  | "out_of_stock"
  | "asset_transfer_request"
  | "asset_transfer_approved"
  | "asset_transfer_rejected"
  | "overdue_asset"
  | "certificate_issued"
  | "certificate_transferred"
  | "certificate_revoked"

// Asset Checkout types
export interface AssetCheckout {
  id: string
  assetId: string
  asset: Asset
  checkedOutById: string
  checkedOutBy: User
  checkoutDate: string
  dueDate: string
  returnDate?: string
  checkedInById?: string
  checkedInBy?: User
  status: CheckoutStatus
  purpose?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CheckoutStatus = "active" | "returned" | "overdue"

// Audit types
export enum AuditEventType {
  ASSET_CREATED = "asset_created",
  ASSET_UPDATED = "asset_updated",
  ASSET_DELETED = "asset_deleted",
  ASSET_TRANSFERRED = "asset_transferred",
  ASSET_ASSIGNED = "asset_assigned",
  ASSET_UNASSIGNED = "asset_unassigned",
  ASSET_CHECKED_OUT = "asset_checked_out",
  ASSET_CHECKED_IN = "asset_checked_in",
  ASSET_MAINTENANCE = "asset_maintenance",
  ASSET_DECOMMISSIONED = "asset_decommissioned",
  INVENTORY_CREATED = "inventory_created",
  INVENTORY_UPDATED = "inventory_updated",
  INVENTORY_TRANSACTION = "inventory_transaction",
  CERTIFICATE_ISSUED = "certificate_issued",
  CERTIFICATE_TRANSFERRED = "certificate_transferred",
  CERTIFICATE_REVOKED = "certificate_revoked",
}

export interface AuditLog {
  id: string
  eventType: AuditEventType
  eventData: Record<string, any>
  assetId?: string
  asset?: Asset
  userId?: string
  user?: User
  performedById?: string
  performedBy?: User
  ipAddress?: string
  userAgent?: string
  onChainLogId?: string
  transactionHash?: string
  verified: boolean
  verifiedAt?: string
  verifiedBy?: string
  previousLogHash?: string
  currentLogHash?: string
  createdAt: string
}

// Certificate types
export enum CertificateStatus {
  ACTIVE = "active",
  TRANSFERRED = "transferred",
  REVOKED = "revoked",
}

export interface AssetCertificate {
  id: string
  certificateNumber: string
  assetId: string
  asset: Asset
  issuedToId: string
  issuedTo: User
  currentOwnerId: string
  currentOwner: User
  issueDate: string
  assetValue: number
  currency: string
  metadata: {
    name: string
    description: string
    imageUrl: string
    attributes: Record<string, any>
  }
  status: CertificateStatus
  onChainCertificateId?: string
  certificateHash?: string
  revocationReason?: string
  revocationDate?: string
  createdAt: string
  updatedAt: string
}
