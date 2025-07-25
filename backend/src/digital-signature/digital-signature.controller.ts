import {
  Controller,
  Post,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { DigitalSignatureService } from './digital-signature.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DigitalSignature } from './entities/digital-signature.entity';

@ApiTags('Digital Signatures')
@Controller('signatures')
export class DigitalSignatureController {
  constructor(private readonly service: DigitalSignatureService) {}

  @Post()
  @ApiOperation({ summary: 'Attach a digital signature to a document' })
  @ApiResponse({ status: 201, description: 'Signature saved successfully', type: DigitalSignature })
  async create(@Body() dto: CreateSignatureDto) {
    return this.service.signDocument(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all signatures for a document' })
  @ApiQuery({ name: 'documentId', required: true })
  @ApiResponse({ status: 200, description: 'List of signatures', type: [DigitalSignature] })
  async getByDocument(@Query('documentId') documentId: string) {
    return this.service.getSignaturesForDocument(documentId);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify if a user signed a document' })
  @ApiQuery({ name: 'documentId', required: true })
  @ApiQuery({ name: 'userId', required: true })
  @ApiResponse({ status: 200, description: 'Returns true if signature exists' })
  async verify(@Query('documentId') documentId: string, @Query('userId') userId: string) {
    return this.service.verifySignature(documentId, userId);
  }
}