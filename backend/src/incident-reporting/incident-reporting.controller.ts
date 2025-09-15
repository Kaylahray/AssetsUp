// Mock controller for Incident Reporting (plain functions)
import { IncidentReportingService } from './incident-reporting.service';

const service = new IncidentReportingService();

// Simulate POST /incidents
export function createIncidentHandler(body: { reporterId: string; assetRef: string; description: string; evidenceFile?: string }) {
  return service.createReport(body.reporterId, body.assetRef, body.description, body.evidenceFile);
}

// Simulate GET /incidents
export function listIncidentsHandler(status?: 'OPEN' | 'RESOLVED') {
  return service.listReports(status);
}

// Simulate PATCH /incidents/:id/resolve
export function resolveIncidentHandler(id: number) {
  return service.resolveReport(id);
}
