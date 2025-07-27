import { NestFactory } from '@nestjs/core';
import { UsageStatsModule } from './usage-stats.module';
import { UsageStatsService } from './usage-stats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageStat } from './usage-stats.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext({
    module: UsageStatsModule,
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'test',
        entities: [UsageStat],
        synchronize: true,
      }),
      TypeOrmModule.forFeature([UsageStat]),
      UsageStatsModule,
    ],
  } as any);
  const service = app.get(UsageStatsService);
  await service.seed();
  await app.close();
}

bootstrap();
