import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CustomFieldsService } from "./custom-fields.service"
import { CustomFieldDefinition, CustomFieldType } from "./entities/custom-field-definition.entity"
import { CustomFieldValue } from "./entities/custom-field-value.entity"
import { BadRequestException } from "@nestjs/common"

describe("CustomFieldsService validation", () => {
  let service: CustomFieldsService
  let defsRepo: Repository<CustomFieldDefinition>
  let valuesRepo: Repository<CustomFieldValue>

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CustomFieldsService,
        { provide: getRepositoryToken(CustomFieldDefinition), useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(CustomFieldValue), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn() } },
      ],
    }).compile()

    service = moduleRef.get(CustomFieldsService)
    defsRepo = moduleRef.get(getRepositoryToken(CustomFieldDefinition))
    valuesRepo = moduleRef.get(getRepositoryToken(CustomFieldValue))
  })

  it("accepts valid dropdown value", async () => {
    const def: CustomFieldDefinition = {
      id: "id1",
      fieldName: "Priority",
      fieldType: CustomFieldType.DROPDOWN,
      allowedValues: ["Low", "High"],
      linkedModule: "assets",
      isRequired: true,
      values: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ;(defsRepo.findOne as any).mockResolvedValue(def)
    ;(valuesRepo.create as any).mockImplementation((v: any) => v)
    ;(valuesRepo.save as any).mockImplementation((v: any) => v)

    const saved = await service.createValue({ fieldId: "id1", referenceId: "ASSET-1", value: "Low" })
    expect(saved.value).toBe("Low")
  })

  it("rejects invalid dropdown value", async () => {
    const def: CustomFieldDefinition = {
      id: "id2",
      fieldName: "Priority",
      fieldType: CustomFieldType.DROPDOWN,
      allowedValues: ["Low", "High"],
      linkedModule: "assets",
      isRequired: true,
      values: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ;(defsRepo.findOne as any).mockResolvedValue(def)
    await expect(
      service.createValue({ fieldId: "id2", referenceId: "ASSET-2", value: "Medium" }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it("rejects wrong type (number expected)", async () => {
    const def: CustomFieldDefinition = {
      id: "id3",
      fieldName: "Weight",
      fieldType: CustomFieldType.NUMBER,
      allowedValues: null,
      linkedModule: "assets",
      isRequired: false,
      values: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ;(defsRepo.findOne as any).mockResolvedValue(def)
    await expect(
      service.createValue({ fieldId: "id3", referenceId: "ASSET-3", value: "12" }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it("allows optional empty", async () => {
    const def: CustomFieldDefinition = {
      id: "id4",
      fieldName: "Comment",
      fieldType: CustomFieldType.TEXT,
      allowedValues: null,
      linkedModule: "assets",
      isRequired: false,
      values: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ;(defsRepo.findOne as any).mockResolvedValue(def)
    ;(valuesRepo.create as any).mockImplementation((v: any) => v)
    ;(valuesRepo.save as any).mockImplementation((v: any) => v)

    const saved = await service.createValue({ fieldId: "id4", referenceId: "ASSET-4", value: "" })
    expect(saved.value).toBe("")
  })
})


