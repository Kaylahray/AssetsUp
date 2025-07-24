import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Asset } from "../../assets/entities/asset.entity"
import { Branch } from "../../branches/entities/branch.entity"

export enum UserRole {
  ADMIN = "admin",
  ASSET_MANAGER = "asset_manager",
  DEPARTMENT_HEAD = "department_head",
  EMPLOYEE = "employee",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole

  @Column({ nullable: true })
  department: string

  @Column({ nullable: true })
  position: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  avatar: string

  @Column({ default: true })
  isActive: boolean

  @ManyToOne(
    () => Branch,
    (branch) => branch.users,
    { nullable: true },
  )
  @JoinColumn({ name: "branchId" })
  branch: Branch

  @Column({ nullable: true })
  branchId: string

  @OneToMany(
    () => Asset,
    (asset) => asset.assignedTo,
  )
  assignedAssets: Asset[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
