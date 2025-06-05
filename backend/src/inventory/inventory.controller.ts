import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseUUIDPipe } from "@nestjs/common"
import type { InventoryService } from "./inventory.service"
import type { CreateInventoryItemDto } from "./dto/create-inventory-item.dto"
import type { UpdateInventoryItemDto } from "./dto/update-inventory-item.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { InventoryResponseDto } from "./dto/inventory-response.dto"

@ApiTags("inventory")
@Controller("inventory")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({ status: 201, description: 'Item created successfully', type: InventoryResponseDto })
  create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.create(createInventoryItemDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all inventory items" })
  @ApiResponse({ status: 200, description: "Returns all inventory items", type: [InventoryResponseDto] })
  findAll(
    @Query('category') category?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.inventoryService.findAll({
      category,
      department,
      search,
      lowStock: lowStock === "true",
    })
  }

  @Get("low-stock")
  @ApiOperation({ summary: "Get low stock items" })
  @ApiResponse({ status: 200, description: "Returns low stock items", type: [InventoryResponseDto] })
  getLowStock() {
    return this.inventoryService.getLowStock()
  }

  @Get("out-of-stock")
  @ApiOperation({ summary: "Get out of stock items" })
  @ApiResponse({ status: 200, description: "Returns out of stock items", type: [InventoryResponseDto] })
  getOutOfStock() {
    return this.inventoryService.getOutOfStock()
  }

  @Get("summary")
  @ApiOperation({ summary: "Get inventory summary" })
  @ApiResponse({ status: 200, description: "Returns inventory summary" })
  getSummary() {
    return this.inventoryService.getSummary()
  }

  @Get("by-category")
  @ApiOperation({ summary: "Get inventory by category" })
  @ApiResponse({ status: 200, description: "Returns inventory grouped by category" })
  getByCategory() {
    return this.inventoryService.getByCategory()
  }

  @Get("by-department")
  @ApiOperation({ summary: "Get inventory by department" })
  @ApiResponse({ status: 200, description: "Returns inventory grouped by department" })
  getByDepartment() {
    return this.inventoryService.getByDepartment()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiResponse({ status: 200, description: 'Returns the inventory item', type: InventoryResponseDto })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOne(id)
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: "Update an inventory item" })
  @ApiResponse({ status: 200, description: "Item updated successfully", type: InventoryResponseDto })
  @ApiResponse({ status: 404, description: "Item not found" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, updateInventoryItemDto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: 'Delete an inventory item' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.remove(id)
  }
}
