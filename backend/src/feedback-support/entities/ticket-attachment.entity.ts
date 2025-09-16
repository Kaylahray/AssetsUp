import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('ticket_attachments')
@Index(['ticketId'])
@Index(['uploadedBy'])
export class TicketAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_id' })
  ticketId: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_extension', length: 10 })
  fileExtension: string;

  @Column({ name: 'uploaded_by' })
  @Index()
  uploadedBy: string;

  @Column({ name: 'upload_source', default: 'web' })
  uploadSource: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'virus_scan_status', nullable: true })
  virusScanStatus: string;

  @Column({ name: 'virus_scan_result', nullable: true })
  virusScanResult: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Ticket, (ticket) => ticket.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed properties
  get fileSizeInMB(): number {
    return Math.round((this.fileSize / (1024 * 1024)) * 100) / 100;
  }

  get fileSizeInKB(): number {
    return Math.round((this.fileSize / 1024) * 100) / 100;
  }

  get isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  get isDocument(): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ];
    return documentTypes.includes(this.mimeType);
  }

  get isVideo(): boolean {
    return this.mimeType.startsWith('video/');
  }

  get isAudio(): boolean {
    return this.mimeType.startsWith('audio/');
  }

  get isArchive(): boolean {
    const archiveTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip',
      'application/x-tar',
    ];
    return archiveTypes.includes(this.mimeType);
  }

  get fileCategory(): string {
    if (this.isImage) return 'image';
    if (this.isDocument) return 'document';
    if (this.isVideo) return 'video';
    if (this.isAudio) return 'audio';
    if (this.isArchive) return 'archive';
    return 'other';
  }

  get isVirusScanClean(): boolean {
    return this.virusScanStatus === 'completed' && this.virusScanResult === 'clean';
  }

  get downloadUrl(): string {
    return `/api/tickets/${this.ticketId}/attachments/${this.id}/download`;
  }
}
