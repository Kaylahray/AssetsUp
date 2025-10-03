import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // This method can be called by other services or the controller
  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createDto);
    return this.notificationRepository.save(notification);
  }

  async findAllForUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }, // Show newest first
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found.`);
    }

    notification.status = NotificationStatus.READ;
    return this.notificationRepository.save(notification);
  }
}