import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AssetInsuranceService } from './asset-insurance.service';
import { CreateAssetInsuranceDto } from './dto/create-asset-insurance.dto';
import { UpdateAssetInsuranceDto } from './dto/update-asset-insurance.dto';
import { QueryAssetInsuranceDto } from './dto/query-asset-insurance.dto';

@Controller('asset-insurance')
export class AssetInsuranceController {
  constructor(private readonly service: AssetInsuranceService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() dto: CreateAssetInsuranceDto) {
    return this.service.create(dto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  findAll(@Query() q: QueryAssetInsuranceDto) {
    const { assetId, provider, skip, take } = q;
    return this.service.findAll({ assetId, provider, skip, take });
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAssetInsuranceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }

  // Optional quick endpoint to trigger the expiry check manually
  @Post('run-expiry-check')
  runExpiryCheck(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.service.runExpiryNotifications(days);
  }
}
