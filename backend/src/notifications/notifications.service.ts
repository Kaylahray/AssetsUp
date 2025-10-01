import { Injectable, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import type { Notification } from './entities/notification.entity';
import type { CreateNotificationDto } from './dto/create-notification.dto';
import type { UpdateNotificationDto } from './dto/update-notification.dto';
import type { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationsService {
  private notificationsRepository: Repository<Notification>;

  constructor(notificationsRepository: Repository<Notification>) {
    this.notificationsRepository = notificationsRepository;
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    return await this.notificationsRepository.save(notification);
  }

  async findAll(query: QueryNotificationDto): Promise<Notification[]> {
    const where: any = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    if (query.type) {
      where.type = query.type;
    }

    return await this.notificationsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    return await this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return await this.notificationsRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }

  // Helper methods for creating specific notification types
  async createAssetTransferNotification(
    userId: string,
    assetName: string,
    from: string,
    to: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      message: `Asset "${assetName}" has been transferred from ${from} to ${to}`,
      type: 'asset_transfer',
      metadata: { assetName, from, to },
    });
  }

  async createLowStockNotification(
    userId: string,
    itemName: string,
    currentStock: number,
    threshold: number,
  ): Promise<Notification> {
    return this.create({
      userId,
      message: `Low stock alert: "${itemName}" has only ${currentStock} units remaining (threshold: ${threshold})`,
      type: 'low_stock',
      metadata: { itemName, currentStock, threshold },
    });
  }

  async createMaintenanceDueNotification(
    userId: string,
    assetName: string,
    dueDate: Date,
  ): Promise<Notification> {
    return this.create({
      userId,
      message: `Maintenance due for "${assetName}" on ${dueDate.toLocaleDateString()}`,
      type: 'maintenance_due',
      metadata: { assetName, dueDate },
    });
  }
}
