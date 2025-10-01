import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadsService } from './file-uploads.service';
import { FileUploadsController } from './file-uploads.controller';
import { FileUpload } from './entities/file-upload.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    TypeOrmModule.forFeature([FileUpload]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
      }),
    }),
  ],
  controllers: [FileUploadsController],
  providers: [FileUploadsService],
  exports: [FileUploadsService],
})
export class FileUploadsModule {}
