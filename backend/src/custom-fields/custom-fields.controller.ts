import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { CustomFieldsService } from "./custom-fields.service"
import { CreateCustomFieldDefinitionDto } from "./dto/create-custom-field-definition.dto"
import { CreateCustomFieldValueDto } from "./dto/create-custom-field-value.dto"
import { CustomFieldDefinition } from "./entities/custom-field-definition.entity"
import { CustomFieldValue } from "./entities/custom-field-value.entity"

@ApiTags("custom-fields")
@Controller("custom-fields")
export class CustomFieldsController {
  constructor(private service: CustomFieldsService) {}

  @Post("definitions")
  createDefinition(@Body() dto: CreateCustomFieldDefinitionDto): Promise<CustomFieldDefinition> {
    return this.service.createDefinition(dto)
  }

  @Get("definitions")
  listDefinitions(@Query("linkedModule") linkedModule?: string): Promise<CustomFieldDefinition[]> {
    return this.service.listDefinitions(linkedModule)
  }

  @Post("values")
  createValue(@Body() dto: CreateCustomFieldValueDto): Promise<CustomFieldValue> {
    return this.service.createValue(dto)
  }

  @Get("values/:linkedModule/:referenceId")
  valuesForReference(
    @Param("linkedModule") linkedModule: string,
    @Param("referenceId") referenceId: string,
  ): Promise<CustomFieldValue[]> {
    return this.service.valuesForReference(linkedModule, referenceId)
  }
}


