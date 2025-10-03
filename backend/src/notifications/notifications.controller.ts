import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { NotificationsService } from './notifications.service';
import type { CreateNotificationDto } from './dto/create-notification.dto';
import type { UpdateNotificationDto } from './dto/update-notification.dto';
import type { QueryNotificationDto } from './dto/query-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll(query: QueryNotificationDto) {
    return this.notificationsService.findAll(query);
  }

  @Get('user/:userId')
  findByUserId(userId: string) {
    return this.notificationsService.findByUserId(userId);
  }

  @Get('user/:userId/unread-count')
  getUnreadCount(userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  findOne(id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  update(id: string, updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(':id/mark-read')
  @HttpCode(HttpStatus.OK)
  markAsRead(id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(id: string) {
    return this.notificationsService.remove(id);
  }

  // Specific notification creation endpoints
  @Post('asset-transfer')
  @HttpCode(HttpStatus.CREATED)
  createAssetTransfer(body: {
    userId: string;
    assetName: string;
    from: string;
    to: string;
  }) {
    return this.notificationsService.createAssetTransferNotification(
      body.userId,
      body.assetName,
      body.from,
      body.to,
    );
  }

  @Post('low-stock')
  @HttpCode(HttpStatus.CREATED)
  createLowStock(body: {
    userId: string;
    itemName: string;
    currentStock: number;
    threshold: number;
  }) {
    return this.notificationsService.createLowStockNotification(
      body.userId,
      body.itemName,
      body.currentStock,
      body.threshold,
    );
  }

  @Post('maintenance-due')
  @HttpCode(HttpStatus.CREATED)
  createMaintenanceDue(body: {
    userId: string;
    assetName: string;
    dueDate: string;
  }) {
    return this.notificationsService.createMaintenanceDueNotification(
      body.userId,
      body.assetName,
      new Date(body.dueDate),
    );
  }
}
