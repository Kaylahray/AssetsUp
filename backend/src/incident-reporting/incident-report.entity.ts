import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

export enum IncidentReportType {
  ASSET_ISSUE = "Asset Issue",
  USER_COMPLAINT = "User Complaint",
  VENDOR_PERFORMANCE = "Vendor Performance",
  SYSTEM_BUG = "System Bug",
}

export enum IncidentStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  ESCALATED = "ESCALATED",
  CLOSED = "CLOSED",
}

@Entity("incident_reports")
export class IncidentReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column("text")
  description: string;

  @Column({ type: "enum", enum: IncidentReportType })
  @Index()
  reportType: IncidentReportType;

  @Column({ nullable: true })
  @Index()
  referenceId?: string;

  @Column()
  @Index()
  submittedBy: string;

  @Column({ type: "enum", enum: IncidentStatus, default: IncidentStatus.OPEN })
  @Index()
  status: IncidentStatus;

  @Column("simple-array", { nullable: true })
  attachments?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
