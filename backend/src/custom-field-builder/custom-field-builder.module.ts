import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomField } from './custom-field.entity';
import { CustomForm } from './custom-form.entity';
import { CustomFieldBuilderService } from './custom-field-builder.service';
import { CustomFieldBuilderController } from './custom-field-builder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomField, CustomForm])],
  providers: [CustomFieldBuilderService],
  controllers: [CustomFieldBuilderController],
})
export class CustomFieldBuilderModule {}
