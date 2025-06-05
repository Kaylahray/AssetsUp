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
  Query,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common"
import type { AssetCheckoutsService } from "./asset-checkouts.service"
import type { CreateAssetCheckoutDto } from "./dto/create-asset-checkout.dto"
import type { UpdateAssetCheckoutDto } from "./dto/update-asset-checkout.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"
import { CheckoutStatus } from "./entities/asset-checkout.entity"
import { AssetCheckoutResponseDto } from "./dto/asset-checkout-response.dto"

@ApiTags("asset-checkouts")
@Controller("asset-checkouts")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssetCheckoutsController {
  constructor(private readonly assetCheckoutsService: AssetCheckoutsService) {}

  @Get()
  @ApiOperation({ summary: "Get all asset checkouts" })
  @ApiResponse({
    status: 200,
    description: "Returns all asset checkouts",
    type: [AssetCheckoutResponseDto],
  })
  @ApiQuery({ name: "assetId", required: false })
  @ApiQuery({ name: "userId", required: false })
  @ApiQuery({ name: "status", required: false, enum: CheckoutStatus })
  @ApiQuery({ name: "overdue", required: false, type: Boolean })
  async findAll(
    @Query("assetId") assetId?: string,
    @Query("userId") userId?: string,
    @Query("status") status?: CheckoutStatus,
    @Query("overdue") overdue?: boolean,
  ) {
    return this.assetCheckoutsService.findAll({
      assetId,
      userId,
      status,
      overdue: overdue === true || overdue === "true",
    })
  }

  @Get("active")
  @ApiOperation({ summary: "Get active checkouts" })
  @ApiResponse({
    status: 200,
    description: "Returns active checkouts",
    type: [AssetCheckoutResponseDto],
  })
  async getActiveCheckouts() {
    return this.assetCheckoutsService.getActiveCheckouts()
  }

  @Get("overdue")
  @ApiOperation({ summary: "Get overdue checkouts" })
  @ApiResponse({
    status: 200,
    description: "Returns overdue checkouts",
    type: [AssetCheckoutResponseDto],
  })
  async getOverdueCheckouts() {
    return this.assetCheckoutsService.getOverdueCheckouts()
  }

  @Get("asset/:assetId")
  @ApiOperation({ summary: "Get asset checkout history" })
  @ApiResponse({
    status: 200,
    description: "Returns asset checkout history",
    type: [AssetCheckoutResponseDto],
  })
  async getAssetCheckoutHistory(@Param("assetId", ParseUUIDPipe) assetId: string) {
    try {
      return await this.assetCheckoutsService.getAssetCheckoutHistory(assetId)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Invalid asset ID")
    }
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get user checkout history" })
  @ApiResponse({
    status: 200,
    description: "Returns user checkout history",
    type: [AssetCheckoutResponseDto],
  })
  async getUserCheckoutHistory(@Param("userId", ParseUUIDPipe) userId: string) {
    try {
      return await this.assetCheckoutsService.getUserCheckoutHistory(userId)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Invalid user ID")
    }
  }

  @Get("my-checkouts")
  @ApiOperation({ summary: "Get current user's checkouts" })
  @ApiResponse({
    status: 200,
    description: "Returns current user's checkouts",
    type: [AssetCheckoutResponseDto],
  })
  async getMyCheckouts(@Request() req) {
    return this.assetCheckoutsService.getUserCheckoutHistory(req.user.id)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get checkout by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the checkout",
    type: AssetCheckoutResponseDto,
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    try {
      return await this.assetCheckoutsService.findOne(id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Invalid checkout ID")
    }
  }

  @Post()
  @ApiOperation({ summary: "Create a new checkout" })
  @ApiResponse({
    status: 201,
    description: "Checkout created successfully",
    type: AssetCheckoutResponseDto,
  })
  async create(@Body() createAssetCheckoutDto: CreateAssetCheckoutDto, @Request() req) {
    try {
      return await this.assetCheckoutsService.create(createAssetCheckoutDto, req.user.id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Post("qr-checkout")
  @ApiOperation({ summary: "Checkout asset by QR code" })
  @ApiResponse({
    status: 201,
    description: "Checkout created successfully",
    type: AssetCheckoutResponseDto,
  })
  async checkoutByQrCode(@Body() data: { qrData: string; dueDate: Date; purpose?: string }, @Request() req) {
    try {
      return await this.assetCheckoutsService.checkoutByQrCode(data.qrData, req.user.id, data.dueDate, data.purpose)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a checkout" })
  @ApiResponse({
    status: 200,
    description: "Checkout updated successfully",
    type: AssetCheckoutResponseDto,
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateAssetCheckoutDto: UpdateAssetCheckoutDto,
    @Request() req,
  ) {
    try {
      return await this.assetCheckoutsService.update(id, updateAssetCheckoutDto, req.user.id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Patch(":id/return")
  @ApiOperation({ summary: "Return a checked out asset" })
  @ApiResponse({
    status: 200,
    description: "Asset returned successfully",
    type: AssetCheckoutResponseDto,
  })
  async returnAsset(@Param("id", ParseUUIDPipe) id: string, @Body() returnData: { notes?: string }, @Request() req) {
    try {
      return await this.assetCheckoutsService.update(
        id,
        {
          status: CheckoutStatus.RETURNED,
          returnDate: new Date(),
          notes: returnData.notes,
        },
        req.user.id,
      )
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: "Delete a checkout" })
  @ApiResponse({ status: 204, description: "Checkout deleted successfully" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    try {
      await this.assetCheckoutsService.remove(id)
      return { message: "Checkout deleted successfully" }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Post("check-overdue")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: "Check for overdue items and send notifications" })
  @ApiResponse({ status: 200, description: "Overdue check completed" })
  async checkOverdueItems() {
    await this.assetCheckoutsService.checkForOverdueItems()
    return { message: "Overdue check completed" }
  }

  @Post("send-due-reminders")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({ summary: "Send reminders for items due soon" })
  @ApiResponse({ status: 200, description: "Due reminders sent" })
  async sendDueReminders() {
    await this.assetCheckoutsService.sendUpcomingDueReminders()
    return { message: "Due reminders sent" }
  }
}
