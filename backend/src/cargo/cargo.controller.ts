import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CargoService } from './cargo.service';
import { CreateCargoDto } from './dto/create-cargo.dto';

@Controller() // Use root controller to handle both route structures
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  @Post('cargo')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createDto: CreateCargoDto) {
    return this.cargoService.create(createDto);
  }

  @Get('cargo/:id')
  findOne(@Param('id') id: string) {
    return this.cargoService.findOne(id);
  }

  // Fulfills the "GET /shipments/:id/cargo" requirement
  @Get('shipments/:shipmentId/cargo')
  findAllForShipment(@Param('shipmentId') shipmentId: string) {
    return this.cargoService.findAllForShipment(shipmentId);
  }
}