import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractStatus } from './enums/contract-status.enum';

function filenameFactory(req: any, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = extname(file.originalname || '') || '.pdf';
  cb(null, `${unique}${ext}`);
}

@Controller('contracts')
export class ContractsController {
  constructor(private readonly service: ContractsService) {}

  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: ContractStatus,
    @Query('active') active?: string,
    @Query('expired') expired?: string,
  ) {
    const filters = {
      vendorId,
      status,
      active: active === 'true',
      expired: expired === 'true',
    };
    return this.service.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  /**
   * Upload a PDF contract document.
   * Stores to disk at `uploads/contracts` and attaches the resulting path to the contract.
   * Replace storage strategy with S3/GCS logic if needed.
   */
  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/contracts',
        filename: filenameFactory,
      }),
      fileFilter: (req, file, cb) => {
        // allow common PDF MIME types
        if (!file.mimetype || !file.mimetype.includes('pdf')) {
          // multer expects an Error object or null; Nest will convert thrown errors properly too
          return cb(new BadRequestException('Only PDF files are allowed') as any, false);
        }
        cb(null, true);
      },
      limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    }),
  )
  async upload(@Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `/uploads/contracts/${file.filename}`; // serve static files via main.ts or reverse proxy
    return this.service.uploadDocument(id, url);
  }
}
