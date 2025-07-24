import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class DigitalSignature {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'user_123' })
  @Column()
  userId: string;

  @ApiProperty({ example: 'doc_456' })
  @Column()
  documentId: string;

  @ApiProperty({ description: 'Base64-encoded image of the signature' })
  @Column({ type: 'text' })
  signatureImage: string;

  @ApiProperty()
  @CreateDateColumn()
  timestamp: Date;
}