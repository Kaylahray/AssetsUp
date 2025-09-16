// In-memory service for remote deactivation
import { DeactivationRequest } from './deactivation-request.entity';
import { DeactivationAuditLog } from './deactivation-audit-log.entity';

export class RemoteDeactivationService {
  private requests: DeactivationRequest[] = [];
  private auditLogs: DeactivationAuditLog[] = [];
  private nextRequestId = 1;
  private nextAuditId = 1;

  createRequest(deviceId: string, reason: string, requesterId: string): DeactivationRequest {
    const req = new DeactivationRequest(this.nextRequestId++, deviceId, reason, requesterId);
    this.requests.push(req);
    this.log(req.id, deviceId, 'REQUESTED', `Deactivation requested for device ${deviceId} by ${requesterId}`);
    this.simulateDeactivation(req);
    return req;
  }

  // Simulate a successful or failed deactivation
  private simulateDeactivation(req: DeactivationRequest, forceFail = false) {
    if (forceFail) {
      req.status = 'FAILED';
      this.log(req.id, req.deviceId, 'FAILED', `Device ${req.deviceId} deactivation failed.`);
    } else {
      req.status = 'SUCCESS';
      this.log(req.id, req.deviceId, 'DEACTIVATED', `Device ${req.deviceId} deactivated successfully.`);
    }
  }

  // Public method to force failure (for testing)
  failRequest(id: number): boolean {
    const req = this.requests.find(r => r.id === id);
    if (!req || req.status !== 'PENDING') return false;
    this.simulateDeactivation(req, true);
    return true;
  }

  // Cancel a request (if still pending)
  cancelRequest(id: number, cancellerId: string): boolean {
    const req = this.requests.find(r => r.id === id);
    if (!req || req.status !== 'PENDING') return false;
    req.status = 'FAILED';
    this.log(req.id, req.deviceId, 'CANCELLED', `Request cancelled by ${cancellerId}`);
    return true;
  }

  // Filter requests by status
  listRequests(status?: 'PENDING' | 'SUCCESS' | 'FAILED'): DeactivationRequest[] {
    if (status) return this.requests.filter(r => r.status === status);
    return this.requests;
  }

  private log(requestId: number, deviceId: string, action: string, details: string) {
    this.auditLogs.push(new DeactivationAuditLog(this.nextAuditId++, requestId, deviceId, action, details));
  }

  getAuditLogs(requestId?: number): DeactivationAuditLog[] {
    if (requestId) {
      return this.auditLogs.filter(log => log.requestId === requestId);
    }
    return this.auditLogs;
  }
}
