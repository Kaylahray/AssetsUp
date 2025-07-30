import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DeviceStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline',
}

export enum DeviceType {
  SERVER = 'server',
  LAPTOP = 'laptop',
  DESKTOP = 'desktop',
  ROUTER = 'router',
  SWITCH = 'switch',
  PRINTER = 'printer',
}

@Entity('device_health')
@Index(['deviceId', 'createdAt'])
export class DeviceHealth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  deviceId: string;

  @Column({ type: 'varchar', length: 255 })
  deviceName: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.SERVER,
  })
  deviceType: DeviceType;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.HEALTHY,
  })
  @Index()
  status: DeviceStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number; // in Celsius

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cpuUsage: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  memoryUsage: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  diskUsage: number; // percentage

  @Column({ type: 'int', nullable: true })
  batteryLevel: number; // percentage (for laptops)

  @Column({ type: 'boolean', default: true })
  networkConnected: boolean;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'jsonb', nullable: true })
  logs: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}