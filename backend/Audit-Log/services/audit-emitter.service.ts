import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';
import { AuditEvent } from '../audit-log.service';

@Injectable()
export class AuditEmitterService {
  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Emit an audit event
   */
  emit(event: AuditEvent): void {
    this.eventEmitter.emit('audit.log', event);
  }

  /**
   * Convenience methods for common audit events
   */

  emitCreate(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.CREATE,
      resource,
      resourceId,
      description: `Created ${resource.toLowerCase()} (ID: ${resourceId})`,
      details,
      success: true,
    });
  }

  emitUpdate(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.UPDATE,
      resource,
      resourceId,
      description: `Updated ${resource.toLowerCase()} (ID: ${resourceId})`,
      details: {
        oldValues,
        newValues,
      },
      success: true,
    });
  }

  emitDelete(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.DELETE,
      resource,
      resourceId,
      description: `Deleted ${resource.toLowerCase()} (ID: ${resourceId})`,
      details,
      success: true,
    });
  }

  emitRead(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId?: string,
    details?: Record<string, any>,
  ): void {
    const description = resourceId
      ? `Read ${resource.toLowerCase()} (ID: ${resourceId})`
      : `Read ${resource.toLowerCase()} list`;

    this.emit({
      actorId,
      actorName,
      action: AuditAction.READ,
      resource,
      resourceId,
      description,
      details,
      success: true,
    });
  }

  emitLogin(
    actorId: string,
    actorName: string,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.LOGIN,
      resource: AuditResource.SYSTEM,
      description: 'User logged in',
      details: {
        loginMethod: 'credentials',
      },
      ipAddress,
      userAgent,
      sessionId,
      success: true,
    });
  }

  emitLogout(
    actorId: string,
    actorName: string,
    sessionId?: string,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.LOGOUT,
      resource: AuditResource.SYSTEM,
      description: 'User logged out',
      sessionId,
      success: true,
    });
  }

  emitAssign(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    assignedTo: string,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.ASSIGN,
      resource,
      resourceId,
      description: `Assigned ${resource.toLowerCase()} (ID: ${resourceId}) to user ${assignedTo}`,
      details: {
        assignedTo,
        ...details,
      },
      success: true,
    });
  }

  emitUnassign(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    unassignedFrom: string,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.UNASSIGN,
      resource,
      resourceId,
      description: `Unassigned ${resource.toLowerCase()} (ID: ${resourceId}) from user ${unassignedFrom}`,
      details: {
        unassignedFrom,
        ...details,
      },
      success: true,
    });
  }

  emitApprove(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.APPROVE,
      resource,
      resourceId,
      description: `Approved ${resource.toLowerCase()} (ID: ${resourceId})`,
      details,
      success: true,
    });
  }

  emitReject(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    reason?: string,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.REJECT,
      resource,
      resourceId,
      description: `Rejected ${resource.toLowerCase()} (ID: ${resourceId})${reason ? ` - ${reason}` : ''}`,
      details: {
        reason,
        ...details,
      },
      success: true,
    });
  }

  emitArchive(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.ARCHIVE,
      resource,
      resourceId,
      description: `Archived ${resource.toLowerCase()} (ID: ${resourceId})`,
      details,
      success: true,
    });
  }

  emitRestore(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    resourceId: string,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.RESTORE,
      resource,
      resourceId,
      description: `Restored ${resource.toLowerCase()} (ID: ${resourceId})`,
      details,
      success: true,
    });
  }

  emitExport(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    format: string,
    recordCount?: number,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.EXPORT,
      resource,
      description: `Exported ${resource.toLowerCase()} data in ${format} format${recordCount ? ` (${recordCount} records)` : ''}`,
      details: {
        format,
        recordCount,
        ...details,
      },
      success: true,
    });
  }

  emitImport(
    actorId: string,
    actorName: string,
    resource: AuditResource,
    format: string,
    recordCount?: number,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action: AuditAction.IMPORT,
      resource,
      description: `Imported ${resource.toLowerCase()} data from ${format} format${recordCount ? ` (${recordCount} records)` : ''}`,
      details: {
        format,
        recordCount,
        ...details,
      },
      success: true,
    });
  }

  emitError(
    actorId: string,
    actorName: string,
    action: AuditAction,
    resource: AuditResource,
    resourceId: string | undefined,
    error: Error,
    details?: Record<string, any>,
  ): void {
    this.emit({
      actorId,
      actorName,
      action,
      resource,
      resourceId,
      description: `Failed to ${action.toLowerCase()} ${resource.toLowerCase()}${resourceId ? ` (ID: ${resourceId})` : ''}`,
      details: {
        error: error.message,
        ...details,
      },
      success: false,
      errorMessage: error.message,
    });
  }
}
