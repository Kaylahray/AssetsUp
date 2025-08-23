import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { CustomFieldDefinition } from "./custom-field-definition.entity"

@Entity("custom_field_values")
export class CustomFieldValue {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  referenceId: string

  @ManyToOne(() => CustomFieldDefinition, (d) => d.values, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "fieldId" })
  field: CustomFieldDefinition

  @Column()
  fieldId: string

  @Column({ type: "jsonb", nullable: true })
  value: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}


