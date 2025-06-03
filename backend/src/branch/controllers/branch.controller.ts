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
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger"
import type { BranchService } from "../services/branch.service"
import type { CreateBranchDto } from "../dto/create-branch.dto"
import type { UpdateBranchDto } from "../dto/update-branch.dto"
import type { BranchQueryDto } from "../dto/branch-query.dto"
import type { AssignAssetDto, TransferAssetDto, AssignInventoryDto } from "../dto/assign-asset.dto"
import { BranchResponseDto, BranchStatsDto } from "../dto/branch-response.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { BranchGuard } from "../guards/branch.guard"
import { Branch } from "../entities/branch.entity"

@ApiTags("branches")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("branches")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiResponse({ status: 201, description: 'Branch created successfully', type: Branch })
  @ApiResponse({ status: 409, description: 'Branch code already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createBranchDto: CreateBranchDto): Promise<Branch> {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Branches retrieved successfully', type: BranchResponseDto })
  findAll(@Query() query: BranchQueryDto) {
    return this.branchService.findAll(query);
  }

  @Get(':id')
  @UseGuards(BranchGuard)
  @ApiOperation({ summary: 'Get a branch by ID' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Branch retrieved successfully', type: Branch })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Branch> {
    return this.branchService.findOne(id);
  }

  @Get('code/:branchCode')
  @ApiOperation({ summary: 'Get a branch by branch code' })
  @ApiParam({ name: 'branchCode', description: 'Branch code' })
  @ApiResponse({ status: 200, description: 'Branch retrieved successfully', type: Branch })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  findByCode(@Param('branchCode') branchCode: string): Promise<Branch> {
    return this.branchService.findByCode(branchCode);
  }

  @Patch(":id")
  @UseGuards(RolesGuard, BranchGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Update a branch" })
  @ApiParam({ name: "id", description: "Branch UUID" })
  @ApiResponse({ status: 200, description: "Branch updated successfully", type: Branch })
  @ApiResponse({ status: 404, description: "Branch not found" })
  @ApiResponse({ status: 409, description: "Branch code already exists" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBranchDto: UpdateBranchDto): Promise<Branch> {
    return this.branchService.update(id, updateBranchDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 204, description: 'Branch deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete branch with associated data' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.branchService.remove(id);
  }

  @Post(":id/assets/assign")
  @UseGuards(RolesGuard, BranchGuard)
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Assign assets to a branch" })
  @ApiParam({ name: "id", description: "Branch UUID" })
  @ApiResponse({ status: 200, description: "Assets assigned successfully" })
  @ApiResponse({ status: 400, description: "Some assets not found" })
  assignAssets(@Param('id', ParseUUIDPipe) id: string, @Body() assignAssetDto: AssignAssetDto): Promise<void> {
    return this.branchService.assignAssets(id, assignAssetDto)
  }

  @Post(":id/assets/transfer")
  @UseGuards(RolesGuard, BranchGuard)
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Transfer assets from one branch to another" })
  @ApiParam({ name: "id", description: "Source branch UUID" })
  @ApiResponse({ status: 200, description: "Assets transferred successfully" })
  @ApiResponse({ status: 400, description: "Some assets not found in source branch" })
  transferAssets(@Param('id', ParseUUIDPipe) id: string, @Body() transferAssetDto: TransferAssetDto): Promise<void> {
    return this.branchService.transferAssets(id, transferAssetDto)
  }

  @Post(":id/inventories/assign")
  @UseGuards(RolesGuard, BranchGuard)
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Assign inventories to a branch" })
  @ApiParam({ name: "id", description: "Branch UUID" })
  @ApiResponse({ status: 200, description: "Inventories assigned successfully" })
  @ApiResponse({ status: 400, description: "Some inventories not found" })
  assignInventories(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignInventoryDto: AssignInventoryDto,
  ): Promise<void> {
    return this.branchService.assignInventories(id, assignInventoryDto)
  }

  @Get(':id/stats')
  @UseGuards(BranchGuard)
  @ApiOperation({ summary: 'Get branch statistics' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Branch statistics retrieved successfully', type: BranchStatsDto })
  getBranchStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.branchService.getBranchStats(id);
  }

  @Post(":id/users/:userId/assign")
  @UseGuards(RolesGuard, BranchGuard)
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Assign a user to a branch" })
  @ApiParam({ name: "id", description: "Branch UUID" })
  @ApiParam({ name: "userId", description: "User UUID" })
  @ApiResponse({ status: 200, description: "User assigned to branch successfully" })
  @ApiResponse({ status: 409, description: "User already assigned to this branch" })
  assignUserToBranch(
    @Param('id', ParseUUIDPipe) branchId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    return this.branchService.assignUserToBranch(branchId, userId)
  }

  @Delete(":id/users/:userId")
  @UseGuards(RolesGuard, BranchGuard)
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a user from a branch" })
  @ApiParam({ name: "id", description: "Branch UUID" })
  @ApiParam({ name: "userId", description: "User UUID" })
  @ApiResponse({ status: 204, description: "User removed from branch successfully" })
  removeUserFromBranch(
    @Param('id', ParseUUIDPipe) branchId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    return this.branchService.removeUserFromBranch(branchId, userId)
  }
}
