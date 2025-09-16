import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { IncidentReport, IncidentStatus, IncidentReportType } from './incident-report.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';

import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

export interface ListIncidentsQuery {
  status?: IncidentStatus;
  reportType?: IncidentReportType;
  submittedBy?: string;
  referenceId?: string;
  search?: string;
}

@Injectable()
export class IncidentReportingService {
  constructor(
    @InjectRepository(IncidentReport)
    private readonly repo: Repository<IncidentReport>,
    private readonly notifications: NotificationsService,
  ) {}

  async create(data: CreateIncidentDto): Promise<IncidentReport> {
    const entity = this.repo.create({ ...data });
    return this.repo.save(entity);
  }

  async update(id: string, data: UpdateIncidentDto): Promise<IncidentReport> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Incident report not found');
    // Prevent illegal status jumps via update; use close/escalate endpoints
    if (data.status && data.status !== existing.status) {
      throw new BadRequestException('Use dedicated endpoints to change status');
    }
    const merged = this.repo.merge(existing, data);
    return this.repo.save(merged);
  }

  async close(id: string): Promise<IncidentReport> {
    const report = await this.repo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Incident report not found');
    if (report.status === IncidentStatus.CLOSED) return report;
    report.status = IncidentStatus.CLOSED;
    return this.repo.save(report);
  }

  async escalate(id: string): Promise<IncidentReport> {
    const report = await this.repo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Incident report not found');
    if (report.status === IncidentStatus.ESCALATED) return report;
    report.status = IncidentStatus.ESCALATED;
    const saved = await this.repo.save(report);
    // Mock notification trigger to an admin/escalation queue
    const payload: CreateNotificationDto = {
      senderId: report.submittedBy,
      receiverId: 'admin',
      message: `Incident escalated: ${report.title} (${report.reportType})`,
    };
    try {
      await this.notifications.create(payload);
    } catch (e) {
      // best-effort; do not fail escalation on notification errors
    }
    return saved;
  }

  async findById(id: string): Promise<IncidentReport> {
    const report = await this.repo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Incident report not found');
    return report;
  }

  async list(query: ListIncidentsQuery = {}): Promise<IncidentReport[]> {
    const where: FindOptionsWhere<IncidentReport> = {};
    if (query.status) where.status = query.status;
    if (query.reportType) where.reportType = query.reportType;
    if (query.submittedBy) where.submittedBy = query.submittedBy;
    if (query.referenceId) where.referenceId = query.referenceId;

    return this.repo.find({
      where: [
        {
          ...where,
          ...(query.search
            ? { description: ILike(`%${query.search}%`) }
            : {}),
        },
        {
          ...where,
          ...(query.search ? { title: ILike(`%${query.search}%`) } : {}),
        },
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
