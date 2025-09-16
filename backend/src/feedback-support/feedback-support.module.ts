import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FeedbackSupportService } from './feedback-support.service';
import { FeedbackSupportController } from './feedback-support.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketAttachment } from './entities/ticket-attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketAttachment]),
    MulterModule.register({
      dest: './uploads/tickets',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [FeedbackSupportController],
  providers: [FeedbackSupportService],
  exports: [FeedbackSupportService],
})
export class FeedbackSupportModule {}
