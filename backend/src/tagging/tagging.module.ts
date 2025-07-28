import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TaggedResource } from './entities/tagged-resource.entity';
import { TagService } from './services/tag.service';
import { TagController } from './controllers/tag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, TaggedResource])],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService, TypeOrmModule],
})
export class TaggingModule {}