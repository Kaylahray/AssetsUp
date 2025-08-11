import { Controller, Post, Get, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { File } from './file.entity';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // Handle file upload
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const filename = `${uuidv4()}${path.extname(file.originalname)}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<File> {
    return this.fileService.saveFile(file);
  }

  // Retrieve file by ID
  @Get(':id')
  async getFile(@Param('id') id: number): Promise<File> {
    return this.fileService.getFileById(id);
  }

  // Delete file by ID
  @Delete(':id')
  async deleteFile(@Param('id') id: number): Promise<void> {
    return this.fileService.deleteFile(id);
  }
}
