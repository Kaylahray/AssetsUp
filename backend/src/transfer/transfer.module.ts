import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferRequest } from './transfer-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransferRequest])],
  controllers: [TransferController],
  providers: [TransferService],
  exports: [TransferService]
})
export class TransferModule {}
