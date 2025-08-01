import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Request } from 'express';
import { AuditLogService, AuditEvent } from '../audit-log.service';
import { AUDIT_METADATA_KEY, AuditOptions } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    // Skip if no user context (e.g., public endpoints)
    if (!user) {
      return next.handle();
    }

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Extract request information
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];
    const sessionId = this.extractSessionId(request);

    // Get resource ID from request parameters
    const resourceId = this.extractResourceId(request, auditOptions);

    // Prepare base audit event
    const baseAuditEvent: Partial<AuditEvent> = {
      actorId: user.id,
      actorName: user.email || user.name,
      action: auditOptions.action,
      resource: auditOptions.resource,
      resourceId,
      ipAddress,
      userAgent,
      sessionId,
      requestId,
    };

    return next.handle().pipe(
      tap((result) => {
        // Success case
        this.logAuditEvent({
          ...baseAuditEvent,
          description: this.buildDescription(auditOptions, request, result, true),
          details: this.buildDetails(auditOptions, request, result, startTime),
          success: true,
        } as AuditEvent);
      }),
      catchError((error) => {
        // Error case
        if (!auditOptions.skipOnError) {
          this.logAuditEvent({
            ...baseAuditEvent,
            description: this.buildDescription(auditOptions, request, null, false),
            details: this.buildDetails(auditOptions, request, null, startTime, error),
            success: false,
            errorMessage: error.message || 'Unknown error',
          } as AuditEvent);
        }
        return throwError(() => error);
      }),
    );
  }

  private async logAuditEvent(auditEvent: AuditEvent): Promise<void> {
    try {
      await this.auditLogService.log(auditEvent);
    } catch (error) {
      this.logger.error('Failed to log audit event', error);
    }
  }

  private buildDescription(
    options: AuditOptions,
    request: Request,
    result: any,
    success: boolean,
  ): string {
    if (options.description) {
      return options.description;
    }

    const action = options.action.toLowerCase();
    const resource = options.resource.toLowerCase();
    const resourceId = this.extractResourceId(request, options);

    let description = `${action} ${resource}`;
    
    if (resourceId) {
      description += ` (ID: ${resourceId})`;
    }

    if (!success) {
      description += ' - FAILED';
    }

    return description.charAt(0).toUpperCase() + description.slice(1);
  }

  private buildDetails(
    options: AuditOptions,
    request: Request,
    result: any,
    startTime: number,
    error?: any,
  ): Record<string, any> {
    const details: Record<string, any> = {
      method: request.method,
      url: request.url,
      duration: Date.now() - startTime,
    };

    // Include request body if specified
    if (options.includeBody && request.body) {
      details.requestBody = this.sanitizeData(request.body);
    }

    // Include query parameters
    if (Object.keys(request.query).length > 0) {
      details.queryParams = request.query;
    }

    // Include route parameters
    if (request.params && Object.keys(request.params).length > 0) {
      details.routeParams = request.params;
    }

    // Include result if specified and available
    if (options.includeResult && result) {
      details.result = this.sanitizeData(result);
    }

    // Include error details if present
    if (error) {
      details.error = {
        message: error.message,
        stack: error.stack,
        code: error.code,
      };
    }

    return details;
  }

  private extractResourceId(request: Request, options: AuditOptions): string | undefined {
    // Try to get ID from route parameters
    if (request.params?.id) {
      return request.params.id;
    }

    // Try to get ID from request body
    if (request.body?.id) {
      return request.body.id;
    }

    // Try to get ID from query parameters
    if (request.query?.id) {
      return request.query.id as string;
    }

    return undefined;
  }

  private getClientIp(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private extractSessionId(request: Request): string | undefined {
    // Try to get session ID from various sources
    return (
      request.headers['x-session-id'] as string ||
      request.cookies?.sessionId ||
      request.session?.id
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeData(data: any): any {
    if (!data) return data;

    // Clone the data to avoid modifying the original
    const cloned = JSON.parse(JSON.stringify(data));

    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
    ];

    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = sanitize(value);
          }
        }
        return sanitized;
      }

      return obj;
    };

    return sanitize(cloned);
  }
}
