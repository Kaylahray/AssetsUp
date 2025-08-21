import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisposalRegistryController } from './disposal-registry.controller';
import { DisposalRegistryService } from './disposal-registry.service';
import { DisposalRecord } from './entities/disposal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DisposalRecord])],
  controllers: [DisposalRegistryController],
  providers: [DisposalRegistryService],
  exports: [DisposalRegistryService],
})
export class DisposalRegistryModule {}
