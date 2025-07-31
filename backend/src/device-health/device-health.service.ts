import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeviceHealth, DeviceStatus, DeviceType } from './entities/device-health.entity';
import { CreateDeviceHealthDto, DeviceHealthQueryDto, DeviceHealthStatsDto } from './dto/create-device-health.dto';

@Injectable()
export class DeviceHealthService {
  private readonly logger = new Logger(DeviceHealthService.name);
  
  // Mock devices for simulation
  private readonly mockDevices = [
    { id: 'SRV-001', name: 'Main Web Server', type: DeviceType.SERVER },
    { id: 'SRV-002', name: 'Database Server', type: DeviceType.SERVER },
    { id: 'SRV-003', name: 'File Server', type: DeviceType.SERVER },
    { id: 'LAP-001', name: 'Admin Laptop', type: DeviceType.LAPTOP },
    { id: 'LAP-002', name: 'Developer Laptop', type: DeviceType.LAPTOP },
    { id: 'RTR-001', name: 'Main Router', type: DeviceType.ROUTER },
    { id: 'SW-001', name: 'Core Switch', type: DeviceType.SWITCH },
    { id: 'PRT-001', name: 'Office Printer', type: DeviceType.PRINTER },
  ];

  constructor(
    @InjectRepository(DeviceHealth)
    private readonly deviceHealthRepository: Repository<DeviceHealth>,
  ) {}

  async create(createDto: CreateDeviceHealthDto): Promise<DeviceHealth> {
    const deviceHealth = this.deviceHealthRepository.create({
      ...createDto,
      lastSeen: new Date(),
    });

    return await this.deviceHealthRepository.save(deviceHealth);
  }

  async findAll(queryDto: DeviceHealthQueryDto) {
    const { deviceId, status, deviceType, page, limit, sortBy, sortOrder } = queryDto;
    
    const query = this.deviceHealthRepository.createQueryBuilder('dh');

    if (deviceId) {
      query.andWhere('dh.deviceId = :deviceId', { deviceId });
    }

    if (status) {
      query.andWhere('dh.status = :status', { status });
    }

    if (deviceType) {
      query.andWhere('dh.deviceType = :deviceType', { deviceType });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Sorting
    query.orderBy(`dh.${sortBy}`, sortOrder);

    const [devices, total] = await query.getManyAndCount();

    return {
      data: devices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findLatestByDevice(): Promise<DeviceHealth[]> {
    // Get the latest health record for each device
    const latestRecords = await this.deviceHealthRepository
      .createQueryBuilder('dh1')
      .select('dh1.*')
      .distinctOn(['dh1.deviceId'])
      .orderBy('dh1.deviceId')
      .addOrderBy('dh1.createdAt', 'DESC')
      .getRawMany();

    return latestRecords;
  }

  async findLatestByDeviceId(deviceId: string): Promise<DeviceHealth> {
    const device = await this.deviceHealthRepository
      .createQueryBuilder('dh')
      .where('dh.deviceId = :deviceId', { deviceId })
      .orderBy('dh.createdAt', 'DESC')
      .getOne();

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    return device;
  }

  async getHealthStats(): Promise<DeviceHealthStatsDto> {
    const latestDevices = await this.findLatestByDevice();
    
    const stats = {
      totalDevices: latestDevices.length,
      healthyDevices: latestDevices.filter(d => d.status === DeviceStatus.HEALTHY).length,
      warningDevices: latestDevices.filter(d => d.status === DeviceStatus.WARNING).length,
      criticalDevices: latestDevices.filter(d => d.status === DeviceStatus.CRITICAL).length,
      offlineDevices: latestDevices.filter(d => d.status === DeviceStatus.OFFLINE).length,
      averageTemperature: this.calculateAverage(latestDevices.map(d => d.temperature).filter(t => t !== null)),
      averageCpuUsage: this.calculateAverage(latestDevices.map(d => d.cpuUsage).filter(c => c !== null)),
      averageMemoryUsage: this.calculateAverage(latestDevices.map(d => d.memoryUsage).filter(m => m !== null)),
      devicesWithErrors: latestDevices.filter(d => d.errorCount > 0).length,
    };

    return stats;
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 100) / 100;
  }

  // Dummy simulator - runs every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async simulateDeviceHealth() {
    this.logger.log('Running device health simulation...');

    try {
      for (const mockDevice of this.mockDevices) {
        const healthData = this.generateRandomHealthData(mockDevice);
        await this.create(healthData);
      }
      
      this.logger.log(`Simulated health data for ${this.mockDevices.length} devices`);
    } catch (error) {
      this.logger.error('Error during device health simulation:', error);
    }
  }

  private generateRandomHealthData(device: any): CreateDeviceHealthDto {
    const now = new Date();
    const isOffline = Math.random() < 0.05; // 5% chance of being offline
    
    if (isOffline) {
      return {
        deviceId: device.id,
        deviceName: device.name,
        deviceType: device.type,
        status: DeviceStatus.OFFLINE,
        networkConnected: false,
        errorCount: Math.floor(Math.random() * 3),
        logs: [
          {
            timestamp: now.toISOString(),
            level: 'error',
            message: 'Device unreachable',
          }
        ],
        metadata: { lastPing: now.toISOString() },
      };
    }

    const temperature = this.generateTemperature(device.type);
    const cpuUsage = Math.random() * 100;
    const memoryUsage = Math.random() * 100;
    const diskUsage = Math.random() * 100;
    const errorCount = Math.random() < 0.1 ? Math.floor(Math.random() * 5) : 0;

    // Determine status based on metrics
    let status = DeviceStatus.HEALTHY;
    if (temperature > 80 || cpuUsage > 90 || memoryUsage > 95 || errorCount > 2) {
      status = DeviceStatus.CRITICAL;
    } else if (temperature > 70 || cpuUsage > 80 || memoryUsage > 85 || errorCount > 0) {
      status = DeviceStatus.WARNING;
    }

    const healthData: CreateDeviceHealthDto = {
      deviceId: device.id,
      deviceName: device.name,
      deviceType: device.type,
      status,
      temperature: Math.round(temperature * 100) / 100,
      cpuUsage: Math.round(cpuUsage * 100) / 100,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      diskUsage: Math.round(diskUsage * 100) / 100,
      networkConnected: true,
      errorCount,
      logs: this.generateLogs(status, errorCount),
      metadata: {
        uptime: Math.floor(Math.random() * 100000),
        processes: Math.floor(Math.random() * 200) + 50,
        lastHealthCheck: now.toISOString(),
      },
    };

    // Add battery level for laptops
    if (device.type === DeviceType.LAPTOP) {
      healthData.batteryLevel = Math.floor(Math.random() * 100);
    }

    return healthData;
  }

  private generateTemperature(deviceType: DeviceType): number {
    const baseTemp = {
      [DeviceType.SERVER]: 45,
      [DeviceType.LAPTOP]: 40,
      [DeviceType.DESKTOP]: 35,
      [DeviceType.ROUTER]: 50,
      [DeviceType.SWITCH]: 45,
      [DeviceType.PRINTER]: 30,
    };

    const base = baseTemp[deviceType] || 40;
    const variation = (Math.random() - 0.5) * 20;
    return Math.max(20, base + variation);
  }

  private generateLogs(status: DeviceStatus, errorCount: number): Record<string, any>[] {
    const logs = [];
    const now = new Date();

    // Always add a health check log
    logs.push({
      timestamp: now.toISOString(),
      level: 'info',
      message: 'Health check completed',
      component: 'health-monitor',
    });

    // Add error logs if there are errors
    for (let i = 0; i < errorCount; i++) {
      const errorMessages = [
        'High CPU usage detected',
        'Memory threshold exceeded',
        'Disk space running low',
        'Network connectivity issue',
        'Service restart required',
        'Temperature warning',
      ];

      logs.push({
        timestamp: new Date(now.getTime() - Math.random() * 300000).toISOString(), // Within last 5 minutes
        level: 'error',
        message: errorMessages[Math.floor(Math.random() * errorMessages.length)],
        component: ['cpu-monitor', 'memory-monitor', 'disk-monitor', 'network-monitor'][Math.floor(Math.random() * 4)],
      });
    }

    // Add warning logs for warning status
    if (status === DeviceStatus.WARNING) {
      logs.push({
        timestamp: now.toISOString(),
        level: 'warn',
        message: 'Device performance degraded',
        component: 'performance-monitor',
      });
    }

    return logs;
  }

  // Manual trigger for testing
  async triggerSimulation(): Promise<void> {
    await this.simulateDeviceHealth();
  }
}