import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadsService } from './file-uploads.service';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('File Uploads')
@Controller('file-uploads')
export class FileUploadsController {
  constructor(private readonly fileUploadsService: FileUploadsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        category: {
          type: 'string',
          enum: ['purchase_receipt', 'contract', 'manual', 'other'],
        },
        description: {
          type: 'string',
        },
        assetId: {
          type: 'string',
        },
        supplierId: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueId = uuidv4();
          const fileExt = extname(file.originalname);
          cb(null, `${uniqueId}${fileExt}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Validate file type
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('File type not allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileUploadDto: CreateFileUploadDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.fileUploadsService.create(file, createFileUploadDto);
  }

  @Get()
  findAll() {
    return this.fileUploadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileUploadsService.findOne(id);
  }

  @Get('asset/:assetId')
  findByAsset(@Param('assetId') assetId: string) {
    return this.fileUploadsService.findByAsset(assetId);
  }

  @Get('supplier/:supplierId')
  findBySupplier(@Param('supplierId') supplierId: string) {
    return this.fileUploadsService.findBySupplier(supplierId);
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.fileUploadsService.findOne(id);
    const stream = createReadStream(file.path);

    res.set({
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Type': file.mimeType,
    });

    return new StreamableFile(stream);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileUploadsService.remove(id);
  }
}
