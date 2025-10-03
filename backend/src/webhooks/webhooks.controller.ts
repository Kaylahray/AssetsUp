
import { Controller, Post, Body, Get } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhookService: WebhooksService) {}

  @Post()
  registerWebhook(@Body() dto: CreateWebhookDto) {
    return this.webhookService.register(dto);
  }

  @Get()
  findAll() {
    return this.webhookService.findAll();
  }
}
