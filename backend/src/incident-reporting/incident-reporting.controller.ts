// Simulate POST /incidents/:id/comments
export function addCommentHandler(reportId: number, commenterId: string, text: string) {
  return service.addComment(reportId, commenterId, text);
}

// Simulate GET /incidents/:id/comments
export function listCommentsHandler(reportId: number) {
  return service.listComments(reportId);
}

// Simulate PATCH /incidents/:id/reopen
export function reopenIncidentHandler(id: number) {
  return service.reopenReport(id);
}
// Mock controller for Incident Reporting (plain functions)
import { IncidentReportingService } from './incident-reporting.service';

const service = new IncidentReportingService();

// Simulate POST /incidents
export function createIncidentHandler(body: { reporterId: string; assetRef: string; description: string; evidenceFile?: string }) {
  return service.createReport(body.reporterId, body.assetRef, body.description, body.evidenceFile);
}

// Simulate PATCH /incidents/:id
export function updateIncidentHandler(id: number, data: { assetRef?: string; description?: string; evidenceFile?: string }) {
  return service.updateReport(id, data);
}

// Simulate DELETE /incidents/:id
export function deleteIncidentHandler(id: number) {
  return service.deleteReport(id);
}

// Simulate GET /incidents
export function listIncidentsHandler(filter?: { status?: 'OPEN' | 'RESOLVED'; reporterId?: string; assetRef?: string; from?: Date; to?: Date; search?: string }) {
  return service.listReports(filter);
}

// Simulate PATCH /incidents/:id/resolve
export function resolveIncidentHandler(id: number) {
  return service.resolveReport(id);
}

// Simulate GET /incidents/reporters
export function listReporterIdsHandler() {
  return service.listReporterIds();
}

// Simulate GET /incidents/assets
export function listAssetRefsHandler() {
  return service.listAssetRefs();
}
