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

  private simulateDeactivation(req: DeactivationRequest) {
    // Simulate a successful deactivation
    req.status = 'SUCCESS';
    this.log(req.id, req.deviceId, 'DEACTIVATED', `Device ${req.deviceId} deactivated successfully.`);
  }

  private log(requestId: number, deviceId: string, action: string, details: string) {
    this.auditLogs.push(new DeactivationAuditLog(this.nextAuditId++, requestId, deviceId, action, details));
  }

  listRequests(): DeactivationRequest[] {
    return this.requests;
  }

  getAuditLogs(requestId?: number): DeactivationAuditLog[] {
    if (requestId) {
      return this.auditLogs.filter(log => log.requestId === requestId);
    }
    return this.auditLogs;
  }
}
