import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { diskStorage } from "multer";
import { extname } from "path";
import { PolicyDocumentsService } from "./policy-documents.service";
import { CreatePolicyDocumentDto } from "./dto/create-policy-document.dto";
import { UpdatePolicyDocumentDto } from "./dto/update-policy-document.dto";
import { QueryPolicyDocumentDto } from "./dto/query-policy-document.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { PolicyDocumentStatus, PolicyDocumentType } from "./entities/policy-document.entity";

@Controller("policy-documents")
export class PolicyDocumentsController {
  constructor(private readonly policyDocumentsService: PolicyDocumentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  create(@Body() createPolicyDocumentDto: CreatePolicyDocumentDto, @Request() req) {
    // Set the author ID from the authenticated user
    createPolicyDocumentDto.authorId = req.user.id;
    return this.policyDocumentsService.create(createPolicyDocumentDto);
  }

  @Post("upload")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/policy-documents",
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (file.mimetype === "application/pdf") {
          cb(null, true);
        } else {
          cb(new BadRequestException("Only PDF files are allowed"), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    })
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPolicyDocumentDto: CreatePolicyDocumentDto,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // Set file-related fields
    createPolicyDocumentDto.authorId = req.user.id;
    createPolicyDocumentDto.filePath = file.filename;
    createPolicyDocumentDto.fileName = file.filename;
    createPolicyDocumentDto.fileType = file.mimetype;
    createPolicyDocumentDto.fileSize = file.size;
    createPolicyDocumentDto.originalFileName = file.originalname;

    return this.policyDocumentsService.create(createPolicyDocumentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  findAll(@Query() queryDto: QueryPolicyDocumentDto) {
    return this.policyDocumentsService.findAll(queryDto);
  }

  @Get("public")
  findAllPublic() {
    return this.policyDocumentsService.findPublicDocuments();
  }

  @Get("active")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  findActiveDocuments() {
    return this.policyDocumentsService.findActiveDocuments();
  }

  @Get("statistics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager")
  getStatistics() {
    return this.policyDocumentsService.getStatistics();
  }

  @Get("expiring")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager")
  getExpiringDocuments(@Query("days") days: string = "30") {
    return this.policyDocumentsService.findExpiringDocuments(parseInt(days));
  }

  @Get("by-type/:documentType")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  getDocumentsByType(@Param("documentType") documentType: PolicyDocumentType) {
    return this.policyDocumentsService.findDocumentsByType(documentType);
  }

  @Get("by-author/:authorId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager")
  getDocumentsByAuthor(@Param("authorId") authorId: string) {
    return this.policyDocumentsService.getDocumentsByAuthor(authorId);
  }

  @Get("by-department/:department")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  getDocumentsByDepartment(@Param("department") department: string) {
    return this.policyDocumentsService.getDocumentsByDepartment(department);
  }

  @Get("version-history/:title")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  getVersionHistory(@Param("title") title: string) {
    return this.policyDocumentsService.getVersionHistory(title);
  }

  @Get("latest/:title")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  getLatestVersion(@Param("title") title: string) {
    return this.policyDocumentsService.findLatestVersion(title);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  async findOne(@Param("id") id: string) {
    const document = await this.policyDocumentsService.findOne(id);
    
    // Increment view count
    await this.policyDocumentsService.incrementViewCount(id);
    
    return document;
  }

  @Get("title/:title/version/:version")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  findByTitleAndVersion(
    @Param("title") title: string,
    @Param("version") version: string
  ) {
    return this.policyDocumentsService.findByTitleAndVersion(title, version);
  }

  @Get(":id/download")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "manager", "employee")
  async downloadDocument(@Param("id") id: string, @Res() res: Response) {
    const fileInfo = await this.policyDocumentsService.getDocumentFile(id);
    
    // Increment download count
    await this.policyDocumentsService.incrementDownloadCount(id);
    
    res.download(fileInfo.filePath, fileInfo.fileName);
  }

  @Get(":id/preview")
  async previewDocument(@Param("id") id: string, @Res() res: Response) {
    try {
      const fileInfo = await this.policyDocumentsService.getDocumentPreview(id);
      
      // Increment view count
      await this.policyDocumentsService.incrementViewCount(id);
      
      // Set appropriate headers for PDF preview
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${fileInfo.fileName}"`);
      
      // Stream the file
      const fs = require("fs");
      const fileStream = fs.createReadStream(fileInfo.filePath);
      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    }
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  update(@Param("id") id: string, @Body() updatePolicyDocumentDto: UpdatePolicyDocumentDto) {
    return this.policyDocumentsService.update(id, updatePolicyDocumentDto);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  updateStatus(
    @Param("id") id: string,
    @Body() body: { status: PolicyDocumentStatus; approvedBy?: string },
    @Request() req
  ) {
    return this.policyDocumentsService.updateStatus(
      id,
      body.status,
      body.approvedBy || req.user.name
    );
  }

  @Patch(":id/approve")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  approveDocument(
    @Param("id") id: string,
    @Body() body: { approvalNotes?: string },
    @Request() req
  ) {
    return this.policyDocumentsService.updateStatus(
      id,
      PolicyDocumentStatus.ACTIVE,
      req.user.name
    );
  }

  @Patch(":id/archive")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  archiveDocument(@Param("id") id: string, @Request() req) {
    return this.policyDocumentsService.updateStatus(
      id,
      PolicyDocumentStatus.ARCHIVED,
      req.user.name
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  remove(@Param("id") id: string) {
    return this.policyDocumentsService.remove(id);
  }
} 