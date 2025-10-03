// webhooks/entities/webhook.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column() // e.g. "asset.created", "asset.updated"
  eventType: string;

  @Column({ default: true })
  isActive: boolean;
}
