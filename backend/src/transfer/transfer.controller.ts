// src/transfer/transfer.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { UpdateTransferRequestDto } from './dto/update-transfer-request.dto';
import { QueryTransferRequestDto } from './dto/query-transfer-request.dto';
import { TransferRequest } from './transfer-request.entity';

@Controller('transfer-requests')
export class TransferController {
  constructor(private readonly service: TransferService) {}

  @Post()
  create(@Body() dto: CreateTransferRequestDto): Promise<TransferRequest> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransferRequestDto): Promise<TransferRequest> {
    return this.service.update(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TransferRequest> {
    return this.service.findOne(id);
  }

  @Get()
  findMany(@Query() q: QueryTransferRequestDto) {
    return this.service.findMany(q);
  }
}