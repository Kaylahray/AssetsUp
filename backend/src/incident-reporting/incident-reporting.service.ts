// In-memory service for incident reports
import { IncidentReport, IncidentStatus } from './incident-report.entity';

export class IncidentReportingService {
  private reports: IncidentReport[] = [];
  private nextId = 1;

  createReport(reporterId: string, assetRef: string, description: string, evidenceFile?: string): IncidentReport {
    const report = new IncidentReport(this.nextId++, reporterId, assetRef, description, evidenceFile);
    this.reports.push(report);
    return report;
  }

  listReports(status?: IncidentStatus): IncidentReport[] {
    if (status) return this.reports.filter(r => r.status === status);
    return this.reports;
  }

  resolveReport(id: number): IncidentReport | undefined {
    const report = this.reports.find(r => r.id === id);
    if (report && report.status === 'OPEN') {
      report.status = 'RESOLVED';
      report.resolvedAt = new Date();
    }
    return report;
  }
}
