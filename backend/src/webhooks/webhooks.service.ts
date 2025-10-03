import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import axios from 'axios';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook) private repo: Repository<Webhook>,
  ) {}

  register(dto: CreateWebhookDto) {
    return this.repo.save(dto);
  }

  findAll() {
    return this.repo.find();
  }

  async triggerEvent(eventType: string, payload: any) {
    const webhooks = await this.repo.find({ where: { eventType, isActive: true }});

    for (const hook of webhooks) {
      try {
        await axios.post(hook.url, payload);
      } catch (e) {
        console.error(`Webhook failed: ${hook.url}`, e.message);
      }
    }
  }
}
