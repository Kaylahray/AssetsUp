import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common"
import type { AssetTransfersService } from "./asset-transfers.service"
import type { CreateAssetTransferDto } from "./dto/create-asset-transfer.dto"
import type { UpdateAssetTransferDto } from "./dto/update-asset-transfer.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"
import { TransferStatus } from "./entities/asset-transfer.entity"
import { AssetTransferResponseDto } from "./dto/asset-transfer-response.dto"

@ApiTags("asset-transfers")
@Controller("asset-transfers")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssetTransfersController {
  constructor(private readonly assetTransfersService: AssetTransfersService) {}

  @Get()
  @ApiOperation({ summary: "Get all asset transfers" })
  @ApiResponse({
    status: 200,
    description: "Returns all asset transfers",
    type: [AssetTransferResponseDto],
  })
  @ApiQuery({ name: "assetId", required: false })
  @ApiQuery({ name: "userId", required: false })
  @ApiQuery({ name: "department", required: false })
  @ApiQuery({ name: "status", required: false, enum: TransferStatus })
  async findAll(assetId?: string, userId?: string, department?: string, status?: TransferStatus) {
    return this.assetTransfersService.findAll({
      assetId,
      userId,
      department,
      status,
    })
  }

  @Get("pending")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: "Get pending asset transfers" })
  @ApiResponse({
    status: 200,
    description: "Returns pending asset transfers",
    type: [AssetTransferResponseDto],
  })
  async getPendingTransfers() {
    return this.assetTransfersService.getPendingTransfers()
  }

  @Get("asset/:assetId")
  @ApiOperation({ summary: "Get asset transfer history" })
  @ApiResponse({
    status: 200,
    description: "Returns asset transfer history",
    type: [AssetTransferResponseDto],
  })
  async getAssetTransferHistory(@Param("assetId", ParseUUIDPipe) assetId: string) {
    try {
      return await this.assetTransfersService.getAssetTransferHistory(assetId)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Invalid asset ID")
    }
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get user transfer history" })
  @ApiResponse({
    status: 200,
    description: "Returns user transfer history",
    type: [AssetTransferResponseDto],
  })
  async getUserTransferHistory(@Param("userId", ParseUUIDPipe) userId: string) {
    try {
      return await this.assetTransfersService.getUserTransferHistory(userId)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Invalid user ID")
    }
  }

  @Get("department/:department")
  @ApiOperation({ summary: "Get department transfer history" })
  @ApiResponse({
    status: 200,
    description: "Returns department transfer history",
    type: [AssetTransferResponseDto],
  })
  async getDepartmentTransferHistory(@Param("department") department: string) {
    return this.assetTransfersService.getDepartmentTransferHistory(department)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get asset transfer by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the asset transfer",
    type: AssetTransferResponseDto,
  })
  @ApiResponse({ status: 404, description: "Asset transfer not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    try {
      return await this.assetTransfersService.findOne(id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Invalid transfer ID")
    }
  }

  @Post()
  @ApiOperation({ summary: "Create a new asset transfer" })
  @ApiResponse({
    status: 201,
    description: "Asset transfer created successfully",
    type: AssetTransferResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  async create(@Body() createAssetTransferDto: CreateAssetTransferDto, @Request() req) {
    try {
      return await this.assetTransfersService.create(createAssetTransferDto, req.user.id)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: "Update an asset transfer" })
  @ApiResponse({
    status: 200,
    description: "Asset transfer updated successfully",
    type: AssetTransferResponseDto,
  })
  @ApiResponse({ status: 404, description: "Asset transfer not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateAssetTransferDto: UpdateAssetTransferDto,
    @Request() req,
  ) {
    try {
      return await this.assetTransfersService.update(id, updateAssetTransferDto, req.user.id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: "Delete an asset transfer" })
  @ApiResponse({ status: 204, description: "Asset transfer deleted successfully" })
  @ApiResponse({ status: 404, description: "Asset transfer not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    try {
      await this.assetTransfersService.remove(id)
      return { message: "Asset transfer deleted successfully" }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Patch(":id/approve")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: "Approve an asset transfer" })
  @ApiResponse({
    status: 200,
    description: "Asset transfer approved successfully",
    type: AssetTransferResponseDto,
  })
  @ApiResponse({ status: 404, description: "Asset transfer not found" })
  async approveTransfer(@Param("id", ParseUUIDPipe) id: string, @Request() req) {
    try {
      return await this.assetTransfersService.update(id, { status: TransferStatus.APPROVED }, req.user.id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Patch(":id/reject")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: "Reject an asset transfer" })
  @ApiResponse({
    status: 200,
    description: "Asset transfer rejected successfully",
    type: AssetTransferResponseDto,
  })
  @ApiResponse({ status: 404, description: "Asset transfer not found" })
  async rejectTransfer(@Param("id", ParseUUIDPipe) id: string, @Body() updateDto: { notes?: string }, @Request() req) {
    try {
      return await this.assetTransfersService.update(
        id,
        { status: TransferStatus.REJECTED, notes: updateDto.notes },
        req.user.id,
      )
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }
}
