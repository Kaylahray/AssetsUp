// Entity for incident reports
export type IncidentStatus = 'OPEN' | 'RESOLVED';

export class IncidentComment {
  id: number;
  commenterId: string;
  text: string;
  timestamp: Date;
  constructor(id: number, commenterId: string, text: string) {
    this.id = id;
    this.commenterId = commenterId;
    this.text = text;
    this.timestamp = new Date();
  }
}

export class IncidentReport {
  id: number;
  reporterId: string;
  assetRef: string;
  description: string;
  status: IncidentStatus;
  evidenceFile?: string;
  createdAt: Date;
  resolvedAt?: Date;
  comments: IncidentComment[];

  constructor(id: number, reporterId: string, assetRef: string, description: string, evidenceFile?: string) {
    this.id = id;
    this.reporterId = reporterId;
    this.assetRef = assetRef;
    this.description = description;
    this.status = 'OPEN';
    this.evidenceFile = evidenceFile;
    this.createdAt = new Date();
    this.comments = [];
  }
}
