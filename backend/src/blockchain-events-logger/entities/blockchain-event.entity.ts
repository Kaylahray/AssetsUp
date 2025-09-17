import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  BlockchainEventType,
  BlockchainNetwork,
  EventStatus,
  EventPriority,
} from '../blockchain-events.enums';

@Entity('blockchain_events')
@Index(['assetId', 'eventType'])
@Index(['transactionHash'])
@Index(['blockNumber'])
@Index(['timestamp'])
@Index(['network', 'status'])
export class BlockchainEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id', nullable: true })
  @Index()
  assetId: string;

  @Column({
    type: 'enum',
    enum: BlockchainEventType,
    name: 'event_type',
  })
  @Index()
  eventType: BlockchainEventType;

  @Column({ name: 'transaction_hash', unique: true })
  @Index()
  transactionHash: string;

  @Column({ name: 'block_number', type: 'bigint' })
  @Index()
  blockNumber: string;

  @Column({ type: 'timestamp', name: 'event_timestamp' })
  @Index()
  timestamp: Date;

  @Column({ type: 'jsonb', name: 'event_details', nullable: true })
  eventDetails: Record<string, any>;

  @Column({
    type: 'enum',
    enum: BlockchainNetwork,
    default: BlockchainNetwork.STARKNET_MAINNET,
  })
  network: BlockchainNetwork;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus;

  @Column({
    type: 'enum',
    enum: EventPriority,
    default: EventPriority.MEDIUM,
  })
  priority: EventPriority;

  @Column({ name: 'contract_address', nullable: true })
  contractAddress: string;

  @Column({ name: 'from_address', nullable: true })
  fromAddress: string;

  @Column({ name: 'to_address', nullable: true })
  toAddress: string;

  @Column({ type: 'decimal', precision: 20, scale: 0, nullable: true })
  gasUsed: string;

  @Column({ type: 'decimal', precision: 20, scale: 0, nullable: true })
  gasPrice: string;

  @Column({ type: 'text', nullable: true })
  eventSignature: string;

  @Column({ type: 'jsonb', nullable: true })
  rawEventData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  confirmations: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed properties
  get isConfirmed(): boolean {
    return this.status === EventStatus.CONFIRMED;
  }

  get isFailed(): boolean {
    return this.status === EventStatus.FAILED || this.status === EventStatus.REVERTED;
  }

  get isPending(): boolean {
    return this.status === EventStatus.PENDING;
  }

  get isHighPriority(): boolean {
    return this.priority === EventPriority.HIGH || this.priority === EventPriority.CRITICAL;
  }

  get eventAge(): number {
    return Date.now() - this.timestamp.getTime();
  }

  get eventAgeInHours(): number {
    return Math.floor(this.eventAge / (1000 * 60 * 60));
  }

  get eventAgeInDays(): number {
    return Math.floor(this.eventAge / (1000 * 60 * 60 * 24));
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get totalGasCost(): string | null {
    if (this.gasUsed && this.gasPrice) {
      const gasUsedBigInt = BigInt(this.gasUsed);
      const gasPriceBigInt = BigInt(this.gasPrice);
      return (gasUsedBigInt * gasPriceBigInt).toString();
    }
    return null;
  }
}
