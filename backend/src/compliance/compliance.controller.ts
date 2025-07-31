import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ComplianceService } from "./compliance.service";
import {
  CreateComplianceDto,
  UpdateComplianceDto,
} from "./dto/create-compliance.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";

@Controller("compliance")
export class ComplianceController {
  constructor(private service: ComplianceService) {}

  @Post()
  create(@Body() dto: CreateComplianceDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateComplianceDto) {
    return this.service.update(+id, dto);
  }

  @Post(":id/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/certifications",
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    })
  )
  async upload(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const url = `/uploads/certifications/${file.filename}`;
    return this.service.update(+id, { certificationUrl: url });
  }
}
