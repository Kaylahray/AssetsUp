// Mock controller for Remote Deactivation (plain functions)
import { RemoteDeactivationService } from './remote-deactivation.service';

const service = new RemoteDeactivationService();

// Simulate POST /deactivation-requests
export function createDeactivationRequestHandler(body: { deviceId: string; reason: string; requesterId: string }) {
  return service.createRequest(body.deviceId, body.reason, body.requesterId);
}

// Simulate PATCH /deactivation-requests/:id/fail
export function failDeactivationRequestHandler(id: number) {
  return service.failRequest(id);
}

// Simulate PATCH /deactivation-requests/:id/cancel
export function cancelDeactivationRequestHandler(id: number, cancellerId: string) {
  return service.cancelRequest(id, cancellerId);
}

// Simulate GET /deactivation-requests?status=SUCCESS
export function listDeactivationRequestsHandler(status?: 'PENDING' | 'SUCCESS' | 'FAILED') {
  return service.listRequests(status);
}

// Simulate GET /deactivation-requests/:id/audit-logs
export function getAuditLogsHandler(requestId: number) {
  return service.getAuditLogs(requestId);
}

// Simulate GET /audit-logs (all)
export function getAllAuditLogsHandler() {
  return service.getAuditLogs();
}
