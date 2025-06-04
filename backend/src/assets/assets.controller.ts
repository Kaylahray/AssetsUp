import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
  Query,
  Request,
} from "@nestjs/common"
import { FilesInterceptor } from "@nestjs/platform-express"
import type { AssetsService } from "./assets.service"
import type { CreateAssetDto } from "./dto/create-asset.dto"
import type { UpdateAssetDto } from "./dto/update-asset.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from "@nestjs/swagger"
import { diskStorage } from "multer"
import { extname } from "path"
import { AssetResponseDto } from "./dto/asset-response.dto"

@ApiTags("assets")
@Controller("assets")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: "Get all assets" })
  @ApiResponse({
    status: 200,
    description: "Returns all assets",
    type: [AssetResponseDto],
  })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "department", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "assignedToId", required: false })
  async findAll(
    @Query("category") category: string,
    @Query("department") department: string,
    @Query("status") status: string,
    @Query("search") search: string,
    @Query("assignedToId") assignedToId: string,
  ) {
    return this.assetsService.findAll({
      category,
      department,
      status,
      search,
      assignedToId,
    })
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get assets assigned to a user" })
  @ApiResponse({
    status: 200,
    description: "Returns assets assigned to the user",
    type: [AssetResponseDto],
  })
  async getAssetsByUser(@Param("userId", ParseUUIDPipe) userId: string) {
    try {
      return await this.assetsService.getAssetsByUser(userId)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Invalid user ID")
    }
  }

  @Get("department/:department")
  @ApiOperation({ summary: "Get assets assigned to a department" })
  @ApiResponse({
    status: 200,
    description: "Returns assets assigned to the department",
    type: [AssetResponseDto],
  })
  async getAssetsByDepartment(@Param("department") department: string) {
    return this.assetsService.getAssetsByDepartment(department)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the asset',
    type: AssetResponseDto
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await this.assetsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid asset ID');
    }
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get asset assignment history' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the asset assignment history'
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getAssignmentHistory(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await this.assetsService.getAssignmentHistory(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid asset ID');
    }
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ 
    status: 201, 
    description: 'Asset created successfully',
    type: AssetResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createAssetDto: CreateAssetDto) {
    try {
      return await this.assetsService.create(createAssetDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/assets',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx)$/)) {
          return cb(new BadRequestException('Only image and document files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload asset files (images and documents)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const fileUrls = files.map(file => `${process.env.API_URL || 'http://localhost:3001'}/uploads/assets/${file.filename}`);
    return { urls: fileUrls };
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: "Update an asset" })
  @ApiResponse({
    status: 200,
    description: "Asset updated successfully",
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAssetDto: UpdateAssetDto) {
    try {
      return await this.assetsService.update(id, updateAssetDto)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 204, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.assetsService.remove(id);
      return { message: 'Asset deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid asset ID');
    }
  }

  @Patch(":id/assign-to-user/:userId")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: "Assign asset to user" })
  @ApiResponse({
    status: 200,
    description: "Asset assigned successfully",
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: "Asset or user not found" })
  async assignToUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req,
  ) {
    try {
      return await this.assetsService.assignToUser(id, userId, req.user.id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Patch(":id/assign-to-department/:department")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: "Assign asset to department" })
  @ApiResponse({
    status: 200,
    description: "Asset assigned to department successfully",
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async assignToDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('department') department: string,
    @Request() req,
  ) {
    try {
      return await this.assetsService.assignToDepartment(id, department, req.user.id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Patch(":id/unassign")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: "Unassign asset from user" })
  @ApiResponse({
    status: 200,
    description: "Asset unassigned successfully",
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async unassignFromUser(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    try {
      return await this.assetsService.unassignFromUser(id, req.user.id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Invalid asset ID")
    }
  }

  @Get(':id/qrcode')
  @ApiOperation({ summary: 'Generate QR code for asset' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async generateQrCode(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await this.assetsService.generateQrCode(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid asset ID');
    }
  }
}
