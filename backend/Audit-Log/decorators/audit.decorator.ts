import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';

export interface AuditOptions {
  action: AuditAction;
  resource: AuditResource;
  description?: string;
  includeBody?: boolean;
  includeResult?: boolean;
  skipOnError?: boolean;
}

export const AUDIT_METADATA_KEY = 'audit';

/**
 * Decorator to automatically log audit events for controller methods
 * 
 * @param options - Audit configuration options
 * 
 * @example
 * ```typescript
 * @Audit({
 *   action: AuditAction.CREATE,
 *   resource: AuditResource.ASSET,
 *   description: 'Created new asset',
 *   includeBody: true,
 *   includeResult: false
 * })
 * @Post()
 * createAsset(@Body() createAssetDto: CreateAssetDto) {
 *   return this.assetsService.create(createAssetDto);
 * }
 * ```
 */
export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_METADATA_KEY, options);

/**
 * Predefined audit decorators for common operations
 */
export const AuditCreate = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.CREATE,
    resource,
    description: description || `Created ${resource.toLowerCase()}`,
    includeBody: true,
    includeResult: true,
  });

export const AuditRead = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.READ,
    resource,
    description: description || `Read ${resource.toLowerCase()}`,
    includeBody: false,
    includeResult: false,
  });

export const AuditUpdate = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.UPDATE,
    resource,
    description: description || `Updated ${resource.toLowerCase()}`,
    includeBody: true,
    includeResult: true,
  });

export const AuditDelete = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.DELETE,
    resource,
    description: description || `Deleted ${resource.toLowerCase()}`,
    includeBody: false,
    includeResult: false,
  });

export const AuditLogin = () =>
  Audit({
    action: AuditAction.LOGIN,
    resource: AuditResource.SYSTEM,
    description: 'User logged in',
    includeBody: false,
    includeResult: false,
  });

export const AuditLogout = () =>
  Audit({
    action: AuditAction.LOGOUT,
    resource: AuditResource.SYSTEM,
    description: 'User logged out',
    includeBody: false,
    includeResult: false,
  });

export const AuditAssign = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.ASSIGN,
    resource,
    description: description || `Assigned ${resource.toLowerCase()}`,
    includeBody: true,
    includeResult: true,
  });

export const AuditUnassign = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.UNASSIGN,
    resource,
    description: description || `Unassigned ${resource.toLowerCase()}`,
    includeBody: true,
    includeResult: true,
  });

export const AuditApprove = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.APPROVE,
    resource,
    description: description || `Approved ${resource.toLowerCase()}`,
    includeBody: true,
    includeResult: true,
  });

export const AuditReject = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.REJECT,
    resource,
    description: description || `Rejected ${resource.toLowerCase()}`,
    includeBody: true,
    includeResult: true,
  });

export const AuditArchive = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.ARCHIVE,
    resource,
    description: description || `Archived ${resource.toLowerCase()}`,
    includeBody: false,
    includeResult: true,
  });

export const AuditRestore = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.RESTORE,
    resource,
    description: description || `Restored ${resource.toLowerCase()}`,
    includeBody: false,
    includeResult: true,
  });

export const AuditExport = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.EXPORT,
    resource,
    description: description || `Exported ${resource.toLowerCase()} data`,
    includeBody: false,
    includeResult: false,
  });

export const AuditImport = (resource: AuditResource, description?: string) =>
  Audit({
    action: AuditAction.IMPORT,
    resource,
    description: description || `Imported ${resource.toLowerCase()} data`,
    includeBody: true,
    includeResult: true,
  });
