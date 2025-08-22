import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import {
  CustomFieldDefinition,
  CustomFieldType,
} from "./entities/custom-field-definition.entity"
import { CustomFieldValue } from "./entities/custom-field-value.entity"
import { CreateCustomFieldDefinitionDto } from "./dto/create-custom-field-definition.dto"
import { CreateCustomFieldValueDto } from "./dto/create-custom-field-value.dto"

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectRepository(CustomFieldDefinition)
    private defsRepo: Repository<CustomFieldDefinition>,
    @InjectRepository(CustomFieldValue)
    private valuesRepo: Repository<CustomFieldValue>,
  ) {}

  async createDefinition(dto: CreateCustomFieldDefinitionDto): Promise<CustomFieldDefinition> {
    if (dto.fieldType === CustomFieldType.DROPDOWN && (!dto.allowedValues || dto.allowedValues.length === 0)) {
      throw new BadRequestException("allowedValues must be provided for dropdown fields")
    }
    const def = this.defsRepo.create({
      fieldName: dto.fieldName,
      fieldType: dto.fieldType,
      allowedValues: dto.allowedValues ?? null,
      linkedModule: dto.linkedModule,
      isRequired: !!dto.isRequired,
    })
    return this.defsRepo.save(def)
  }

  async listDefinitions(linkedModule?: string): Promise<CustomFieldDefinition[]> {
    if (linkedModule) {
      return this.defsRepo.find({ where: { linkedModule } })
    }
    return this.defsRepo.find()
  }

  private ensureValueMatches(def: CustomFieldDefinition, value: any) {
    if (def.isRequired && (value === null || value === undefined || value === "")) {
      throw new BadRequestException(`Value for field '${def.fieldName}' is required`)
    }
    if (value === null || value === undefined || value === "") {
      return
    }

    switch (def.fieldType) {
      case CustomFieldType.TEXT: {
        if (typeof value !== "string") {
          throw new BadRequestException(`Expected string for field '${def.fieldName}'`)
        }
        return
      }
      case CustomFieldType.NUMBER: {
        const isNum = typeof value === "number" && !Number.isNaN(value)
        if (!isNum) {
          throw new BadRequestException(`Expected number for field '${def.fieldName}'`)
        }
        return
      }
      case CustomFieldType.BOOLEAN: {
        if (typeof value !== "boolean") {
          throw new BadRequestException(`Expected boolean for field '${def.fieldName}'`)
        }
        return
      }
      case CustomFieldType.DROPDOWN: {
        if (typeof value !== "string") {
          throw new BadRequestException(`Expected string for dropdown field '${def.fieldName}'`)
        }
        const allowed = def.allowedValues ?? []
        if (!allowed.includes(value)) {
          throw new BadRequestException(`Value must be one of: ${allowed.join(", ")}`)
        }
        return
      }
      default:
        throw new BadRequestException("Unsupported field type")
    }
  }

  async createValue(dto: CreateCustomFieldValueDto): Promise<CustomFieldValue> {
    const def = await this.defsRepo.findOne({ where: { id: dto.fieldId } })
    if (!def) {
      throw new NotFoundException("Field definition not found")
    }
    this.ensureValueMatches(def, dto.value)
    const v = this.valuesRepo.create({
      referenceId: dto.referenceId,
      fieldId: dto.fieldId,
      value: dto.value,
    })
    return this.valuesRepo.save(v)
  }

  async valuesForReference(linkedModule: string, referenceId: string): Promise<CustomFieldValue[]> {
    const defs = await this.defsRepo.find({ where: { linkedModule } })
    if (defs.length === 0) return []
    const fieldIds = defs.map((d) => d.id)
    const found = await this.valuesRepo.find({ where: { referenceId } })
    return found.filter((v) => fieldIds.includes(v.fieldId))
  }
}


