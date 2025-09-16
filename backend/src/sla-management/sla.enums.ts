export enum SLAStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export enum SLAPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SLABreachSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export enum AssetCategory {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  NETWORK = 'network',
  SECURITY = 'security',
  INFRASTRUCTURE = 'infrastructure',
  MOBILE = 'mobile',
  OTHER = 'other',
}
