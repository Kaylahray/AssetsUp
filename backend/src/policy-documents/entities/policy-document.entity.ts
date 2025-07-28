import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum PolicyDocumentStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
  EXPIRED = "expired",
}

export enum PolicyDocumentType {
  ASSET_USAGE = "asset_usage",
  SECURITY = "security",
  MAINTENANCE = "maintenance",
  PROCUREMENT = "procurement",
  DISPOSAL = "disposal",
  GENERAL = "general",
}

@Entity("policy_documents")
@Index(["title", "version"], { unique: true })
@Index(["status"])
@Index(["documentType"])
export class PolicyDocument {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 200 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 50 })
  version: string;

  @Column({
    type: "enum",
    enum: PolicyDocumentStatus,
    default: PolicyDocumentStatus.DRAFT,
  })
  status: PolicyDocumentStatus;

  @Column({
    type: "enum",
    enum: PolicyDocumentType,
    default: PolicyDocumentType.GENERAL,
  })
  documentType: PolicyDocumentType;

  @Column({ type: "varchar", length: 500 })
  filePath: string;

  @Column({ type: "varchar", length: 100 })
  fileName: string;

  @Column({ type: "varchar", length: 50 })
  fileType: string;

  @Column({ type: "bigint" })
  fileSize: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  originalFileName: string;

  @Column({ type: "uuid" })
  authorId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column({ type: "date", nullable: true })
  effectiveDate: Date;

  @Column({ type: "date", nullable: true })
  expiryDate: Date;

  @Column({ type: "text", nullable: true })
  summary: string;

  @Column({ type: "text", nullable: true })
  keyPoints: string;

  @Column({ type: "text", nullable: true })
  complianceNotes: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  department: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  category: string;

  @Column({ type: "text", nullable: true })
  tags: string;

  @Column({ type: "boolean", default: false })
  requiresAcknowledgment: boolean;

  @Column({ type: "boolean", default: false })
  isPublic: boolean;

  @Column({ type: "integer", default: 0 })
  downloadCount: number;

  @Column({ type: "integer", default: 0 })
  viewCount: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: "date", nullable: true })
  approvedDate: Date;

  @Column({ type: "text", nullable: true })
  approvalNotes: string;

  @Column({ type: "text", nullable: true })
  changeLog: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  previousVersionId: string;

  @Column({ type: "boolean", default: true })
  isLatestVersion: boolean;

  @Column({ type: "text", nullable: true })
  metadata: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 