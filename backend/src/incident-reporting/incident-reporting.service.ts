// In-memory service for incident reports
import { IncidentReport, IncidentStatus, IncidentComment } from './incident-report.entity';

export class IncidentReportingService {
  private reports: IncidentReport[] = [];
  private nextId = 1;
  private nextCommentId = 1;

  createReport(reporterId: string, assetRef: string, description: string, evidenceFile?: string): IncidentReport {
    const report = new IncidentReport(this.nextId++, reporterId, assetRef, description, evidenceFile);
    this.reports.push(report);
    return report;
  }

  updateReport(id: number, data: { assetRef?: string; description?: string; evidenceFile?: string }): IncidentReport | undefined {
    const report = this.reports.find(r => r.id === id);
    if (!report) return undefined;
    if (data.assetRef) report.assetRef = data.assetRef;
    if (data.description) report.description = data.description;
    if (data.evidenceFile) report.evidenceFile = data.evidenceFile;
    return report;
  }

  deleteReport(id: number): boolean {
    const idx = this.reports.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.reports.splice(idx, 1);
    return true;
  }

  listReports(filter?: { status?: IncidentStatus; reporterId?: string; assetRef?: string; from?: Date; to?: Date; search?: string }): IncidentReport[] {
    let results = this.reports;
    if (filter) {
      results = results.filter(r =>
        (filter.status ? r.status === filter.status : true) &&
        (filter.reporterId ? r.reporterId === filter.reporterId : true) &&
        (filter.assetRef ? r.assetRef === filter.assetRef : true) &&
        (filter.from ? r.createdAt >= filter.from : true) &&
        (filter.to ? r.createdAt <= filter.to : true)
      );
      if (filter.search) {
        const q = filter.search.toLowerCase();
        results = results.filter(r => r.description.toLowerCase().includes(q));
      }
    }
    return results;
  }
  addComment(reportId: number, commenterId: string, text: string): IncidentComment | undefined {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return undefined;
    const comment = new IncidentComment(this.nextCommentId++, commenterId, text);
    report.comments.push(comment);
    return comment;
  }

  listComments(reportId: number): IncidentComment[] | undefined {
    const report = this.reports.find(r => r.id === reportId);
    return report ? report.comments : undefined;
  }

  reopenReport(id: number): IncidentReport | undefined {
    const report = this.reports.find(r => r.id === id);
    if (report && report.status === 'RESOLVED') {
      report.status = 'OPEN';
      report.resolvedAt = undefined;
    }
    return report;
  }

  resolveReport(id: number): IncidentReport | undefined {
    const report = this.reports.find(r => r.id === id);
    if (report && report.status === 'OPEN') {
      report.status = 'RESOLVED';
      report.resolvedAt = new Date();
    }
    return report;
  }

  listReporterIds(): string[] {
    return Array.from(new Set(this.reports.map(r => r.reporterId)));
  }

  listAssetRefs(): string[] {
    return Array.from(new Set(this.reports.map(r => r.assetRef)));
  }
}
