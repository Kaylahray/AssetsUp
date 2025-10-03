// webhooks/dto/create-webhook.dto.ts
import { IsUrl, IsString } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsString()
  eventType: string;
}
