// webhooks/webhooks.listener.ts
import { OnEvent } from '@nestjs/event-emitter';
import { WebhooksService } from './webhooks.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookListener {
  constructor(private webhookService: WebhooksService) {}

  @OnEvent('asset.created')
  handleNewAsset(asset) {
    this.webhookService.triggerEvent('asset.created', asset);
  }
}
