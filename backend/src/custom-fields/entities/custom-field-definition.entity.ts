import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { CustomFieldValue } from "./custom-field-value.entity"

export enum CustomFieldType {
  TEXT = "text",
  DROPDOWN = "dropdown",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

@Entity("custom_field_definitions")
export class CustomFieldDefinition {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: false })
  fieldName: string

  @Column({
    type: "enum",
    enum: CustomFieldType,
  })
  fieldType: CustomFieldType

  @Column({ type: "text", nullable: true, array: true })
  allowedValues?: string[] | null

  @Column()
  linkedModule: string

  @Column({ default: false })
  isRequired: boolean

  @OneToMany(() => CustomFieldValue, (v) => v.field)
  values: CustomFieldValue[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}


