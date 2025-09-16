export enum InsurancePolicyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
  PENDING_RENEWAL = 'pending_renewal',
}

export enum InsuranceType {
  COMPREHENSIVE = 'comprehensive',
  LIABILITY = 'liability',
  PROPERTY = 'property',
  CYBER = 'cyber',
  EQUIPMENT = 'equipment',
  PROFESSIONAL_INDEMNITY = 'professional_indemnity',
  OTHER = 'other',
}

export enum CoverageLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  COMPREHENSIVE = 'comprehensive',
}

export enum RenewalStatus {
  NOT_DUE = 'not_due',
  DUE_SOON = 'due_soon',
  OVERDUE = 'overdue',
  RENEWED = 'renewed',
  CANCELLED = 'cancelled',
}
