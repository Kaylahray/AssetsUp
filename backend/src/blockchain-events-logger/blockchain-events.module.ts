import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainEventsService } from './blockchain-events.service';
import { BlockchainEventsController } from './blockchain-events.controller';
import { BlockchainEvent } from './entities/blockchain-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockchainEvent])],
  controllers: [BlockchainEventsController],
  providers: [BlockchainEventsService],
  exports: [BlockchainEventsService],
})
export class BlockchainEventsModule {}
