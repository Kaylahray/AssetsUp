import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

export enum LoanApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RETURNED = "RETURNED",
}

@Entity({ name: "loan_requests" })
export class LoanRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  borrowerId: string

  @Column({ type: "varchar", length: 100 })
  assetType: string

  @CreateDateColumn({ type: "timestamptz" })
  requestDate: Date

  @Column({ type: "enum", enum: LoanApprovalStatus, default: LoanApprovalStatus.PENDING })
  approvalStatus: LoanApprovalStatus

  @Column({ type: "timestamptz", nullable: true })
  returnDueDate: Date | null

  @Column({ type: "timestamptz", nullable: true })
  returnedAt: Date | null
}


