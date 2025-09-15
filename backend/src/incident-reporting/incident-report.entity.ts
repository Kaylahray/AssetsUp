// Entity for incident reports
export type IncidentStatus = 'OPEN' | 'RESOLVED';

export class IncidentReport {
  id: number;
  reporterId: string;
  assetRef: string;
  description: string;
  status: IncidentStatus;
  evidenceFile?: string;
  createdAt: Date;
  resolvedAt?: Date;

  constructor(id: number, reporterId: string, assetRef: string, description: string, evidenceFile?: string) {
    this.id = id;
    this.reporterId = reporterId;
    this.assetRef = assetRef;
    this.description = description;
    this.status = 'OPEN';
    this.evidenceFile = evidenceFile;
    this.createdAt = new Date();
  }
}
