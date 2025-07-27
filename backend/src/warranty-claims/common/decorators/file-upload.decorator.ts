import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function FileUpload(fieldName: string, maxCount?: number) {
  const interceptor = maxCount 
    ? FilesInterceptor(fieldName, maxCount, {
        storage: diskStorage({
          destination: './uploads/warranty-claims',
          filename: (req, file, cb) => {
            const randomName = Array(32)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('');
            cb(null, `${randomName}${extname(file.originalname)}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) {
            cb(null, true);
          } else {
            cb(new Error('Only image files and PDFs are allowed!'), false);
          }
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      })
    : FileInterceptor(fieldName, {
        storage: diskStorage({
          destination: './uploads/warranty-claims',
          filename: (req, file, cb) => {
            const randomName = Array(32)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('');
            cb(null, `${randomName}${extname(file.originalname)}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) {
            cb(null, true);
          } else {
            cb(new Error('Only image files and PDFs are allowed!'), false);
          }
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      });

  return applyDecorators(
    UseInterceptors(interceptor),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}