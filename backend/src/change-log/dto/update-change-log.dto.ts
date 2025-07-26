import { PartialType } from '@nestjs/swagger';
import { CreateChangeLogDto } from './create-change-log.dto';

export class UpdateChangeLogDto extends PartialType(CreateChangeLogDto) {}
