import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum OnboardingRequestStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

@Entity({ name: "onboarding_requests" })
export class OnboardingRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  requesterId: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "numeric", nullable: true })
  estimatedValue?: number;

  @Column({ nullable: true })
  proposedCategory?: string;

  @Column({
    type: "enum",
    enum: OnboardingRequestStatus,
    default: OnboardingRequestStatus.Pending,
  })
  status: OnboardingRequestStatus;

  // Audit fields
  @Column({ type: "uuid", nullable: true })
  reviewerId?: string | null;

  @Column({ type: "timestamptz", nullable: true })
  reviewedAt?: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
