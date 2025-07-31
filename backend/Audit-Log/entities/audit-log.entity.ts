import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  action: string;

  @Column()
  performedBy: string;

  @Column("jsonb", { nullable: true })
  details: any;

   @Column()
  actionType: string;

  @Column()
  affectedEntity: string;

  @Column({ nullable: true })
  entityId: string;

  @Column()
  initiator: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}

