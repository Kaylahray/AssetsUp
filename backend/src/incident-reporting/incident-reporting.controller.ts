import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IncidentReportingService, ListIncidentsQuery } from './incident-reporting.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentReport } from './incident-report.entity';

function incidentFilenameFactory(req, file, cb) {
  const unique = `${uuidv4()}${path.extname(file.originalname)}`;
  cb(null, unique);
}

@Controller('incident-reports')
export class IncidentReportingController {
  constructor(private readonly service: IncidentReportingService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: diskStorage({
        destination: 'uploads/incidents',
        filename: incidentFilenameFactory,
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!file.mimetype || !allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Only images or PDFs are allowed') as any, false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() body: Omit<CreateIncidentDto, 'attachments'>,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<IncidentReport> {
    const attachments = files?.map((f) => `/uploads/incidents/${f.filename}`);
    return this.service.create({ ...body, attachments });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateIncidentDto): Promise<IncidentReport> {
    return this.service.update(id, body);
  }

  @Patch(':id/close')
  async close(@Param('id') id: string): Promise<IncidentReport> {
    return this.service.close(id);
  }

  @Patch(':id/escalate')
  async escalate(@Param('id') id: string): Promise<IncidentReport> {
    return this.service.escalate(id);
  }

  @Get()
  async list(@Query() query: ListIncidentsQuery): Promise<IncidentReport[]> {
    return this.service.list(query);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<IncidentReport> {
    return this.service.findById(id);
  }
}
