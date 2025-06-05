import { Controller, Get, Post, Body, Param, UseGuards, Query, ParseUUIDPipe, Request } from "@nestjs/common"
import type { StockTransactionsService } from "./stock-transactions.service"
import type { CreateStockTransactionDto } from "./dto/stock-transaction.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { StockTransactionResponseDto } from "./dto/stock-transaction.dto"

@ApiTags("stock-transactions")
@Controller("stock-transactions")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StockTransactionsController {
  constructor(private readonly stockTransactionsService: StockTransactionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: "Create a new stock transaction" })
  @ApiResponse({ status: 201, description: "Transaction created successfully", type: StockTransactionResponseDto })
  create(@Body() createTransactionDto: CreateStockTransactionDto, @Request() req) {
    return this.stockTransactionsService.create(createTransactionDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: "Get all stock transactions" })
  @ApiResponse({ status: 200, description: "Returns all transactions", type: [StockTransactionResponseDto] })
  findAll(
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stockTransactionsService.findAll({
      type,
      search,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiResponse({ status: 200, description: 'Returns recent transactions', type: [StockTransactionResponseDto] })
  getRecent(@Query('limit') limit?: string) {
    return this.stockTransactionsService.getRecent(limit ? Number.parseInt(limit) : 10)
  }

  @Get("summary")
  @ApiOperation({ summary: "Get transaction summary" })
  @ApiResponse({ status: 200, description: "Returns transaction summary" })
  getSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.stockTransactionsService.getSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    )
  }

  @Get('item/:itemId')
  @ApiOperation({ summary: 'Get transactions for a specific item' })
  @ApiResponse({ status: 200, description: 'Returns transactions for the item', type: [StockTransactionResponseDto] })
  findByItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.stockTransactionsService.findByItem(itemId)
  }

  @Post("adjust/:itemId")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: "Adjust stock for an item" })
  @ApiResponse({ status: 201, description: "Stock adjusted successfully", type: StockTransactionResponseDto })
  adjustStock(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() adjustment: { quantity: number; reason: string },
    @Request() req,
  ) {
    return this.stockTransactionsService.adjustStock(itemId, adjustment, req.user.id)
  }
}
