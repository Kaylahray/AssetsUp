import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { createWriteStream } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  // Save file metadata to the database
  async saveFile(file: Express.Multer.File): Promise<File> {
    const fileMetadata = new File();
    fileMetadata.filename = file.originalname;
    fileMetadata.path = path.join('uploads', file.filename);
    fileMetadata.size = file.size;
    fileMetadata.mimeType = file.mimetype;

    return this.fileRepository.save(fileMetadata);
  }

  // Retrieve file metadata from the database
  async getFileById(id: number): Promise<File> {
    return this.fileRepository.findOne(id);
  }

  // Delete a file from the file system and the database
  async deleteFile(id: number): Promise<void> {
    const file = await this.getFileById(id);
    if (file) {
      // Delete from filesystem (assuming files are stored in the 'uploads' folder)
      const fs = require('fs');
      fs.unlinkSync(file.path);

      // Remove from the database
      await this.fileRepository.remove(file);
    }
  }
}
