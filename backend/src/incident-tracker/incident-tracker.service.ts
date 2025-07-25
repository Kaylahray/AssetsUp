import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentResolutionStatus } from './entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Injectable()
export class IncidentTrackerService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    const incident = this.incidentRepository.create(createIncidentDto);
    return this.incidentRepository.save(incident);
  }

  async findAll(): Promise<Incident[]> {
    return this.incidentRepository.find();
  }

  async findOne(id: number): Promise<Incident> {
    const incident = await this.incidentRepository.findOneBy({ id });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async update(id: number, updateIncidentDto: UpdateIncidentDto): Promise<Incident> {
    const incident = await this.findOne(id);
    if (updateIncidentDto.resolutionStatus) {
      // Enforce status flow
      const validTransitions = {
        [IncidentResolutionStatus.PENDING]: [IncidentResolutionStatus.IN_PROGRESS],
        [IncidentResolutionStatus.IN_PROGRESS]: [IncidentResolutionStatus.RESOLVED],
        [IncidentResolutionStatus.RESOLVED]: [],
      };
      if (
        updateIncidentDto.resolutionStatus !== incident.resolutionStatus &&
        !validTransitions[incident.resolutionStatus].includes(updateIncidentDto.resolutionStatus)
      ) {
        throw new BadRequestException(
          `Invalid status transition from ${incident.resolutionStatus} to ${updateIncidentDto.resolutionStatus}`,
        );
      }
    }
    Object.assign(incident, updateIncidentDto);
    return this.incidentRepository.save(incident);
  }

  async remove(id: number): Promise<void> {
    const result = await this.incidentRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Incident not found');
  }
} 