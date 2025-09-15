// Mock controller for Remote Deactivation (plain functions)
import { RemoteDeactivationService } from './remote-deactivation.service';

const service = new RemoteDeactivationService();

// Simulate POST /deactivation-requests
export function createDeactivationRequestHandler(body: { deviceId: string; reason: string; requesterId: string }) {
  return service.createRequest(body.deviceId, body.reason, body.requesterId);
}

// Simulate GET /deactivation-requests
export function listDeactivationRequestsHandler() {
  return service.listRequests();
}

// Simulate GET /deactivation-requests/:id/audit-logs
export function getAuditLogsHandler(requestId: number) {
  return service.getAuditLogs(requestId);
}

// Simulate GET /audit-logs (all)
export function getAllAuditLogsHandler() {
  return service.getAuditLogs();
}
