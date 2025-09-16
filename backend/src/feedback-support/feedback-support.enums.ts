export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_USER = 'pending_user',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum TicketCategory {
  BUG_REPORT = 'bug_report',
  FEATURE_REQUEST = 'feature_request',
  TECHNICAL_SUPPORT = 'technical_support',
  ASSET_ISSUE = 'asset_issue',
  USER_ACCESS = 'user_access',
  SYSTEM_PERFORMANCE = 'system_performance',
  DATA_ISSUE = 'data_issue',
  TRAINING_REQUEST = 'training_request',
  GENERAL_INQUIRY = 'general_inquiry',
  OTHER = 'other',
}

export enum TicketSource {
  WEB_PORTAL = 'web_portal',
  EMAIL = 'email',
  PHONE = 'phone',
  MOBILE_APP = 'mobile_app',
  API = 'api',
  SYSTEM_GENERATED = 'system_generated',
}
