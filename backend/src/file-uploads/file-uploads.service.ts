import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import * as fs from 'fs';

@Injectable()
export class FileUploadsService {
  constructor(
    @InjectRepository(FileUpload)
    private readonly fileUploadRepository: Repository<FileUpload>,
  ) {}

  async create(
    file: Express.Multer.File,
    createFileUploadDto: CreateFileUploadDto,
  ): Promise<FileUpload> {
    const fileUpload = new FileUpload();
    fileUpload.fileName = file.filename;
    fileUpload.originalName = file.originalname;
    fileUpload.mimeType = file.mimetype;
    fileUpload.size = file.size;
    fileUpload.path = file.path;
    fileUpload.category = createFileUploadDto.category;
    fileUpload.description = createFileUploadDto.description;
    fileUpload.assetId = createFileUploadDto.assetId;
    fileUpload.supplierId = createFileUploadDto.supplierId;

    return this.fileUploadRepository.save(fileUpload);
  }

  async findAll(): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      relations: ['asset', 'supplier'],
    });
  }

  async findOne(id: string): Promise<FileUpload> {
    const fileUpload = await this.fileUploadRepository.findOne({
      where: { id },
      relations: ['asset', 'supplier'],
    });

    if (!fileUpload) {
      throw new NotFoundException(`File upload with ID "${id}" not found`);
    }

    return fileUpload;
  }

  async findByAsset(assetId: string): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      where: { assetId },
      relations: ['asset'],
    });
  }

  async findBySupplier(supplierId: string): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      where: { supplierId },
      relations: ['supplier'],
    });
  }

  async remove(id: string): Promise<void> {
    const fileUpload = await this.findOne(id);

    // Delete the physical file
    try {
      await fs.promises.unlink(fileUpload.path);
    } catch (error) {
      console.error(`Error deleting file ${fileUpload.path}:`, error);
    }

    await this.fileUploadRepository.remove(fileUpload);
  }
}
