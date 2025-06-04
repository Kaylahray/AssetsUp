import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"

@Entity("report_templates")
export class ReportTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column()
  reportType: string

  @Column("jsonb")
  config: any

  @Column("jsonb", { nullable: true })
  layout: any

  @Column()
  createdById: string

  @ManyToOne(() => User)
  createdBy: User

  @Column({ default: false })
  isPublic: boolean

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
