import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  actionType:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "LOGOUT"
    | "FAILED_LOGIN";

  @Column()
  entityAffected: string;

  @Column()
  entityId: string;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column("json", { nullable: true })
  metadata: Record<string, any>;
}
